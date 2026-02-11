"use client";

import { getCredential } from "@/lib/api-config";

// 动态导入 COS SDK（只在客户端使用）
let COS: typeof import("cos-js-sdk-v5") | null = null;

/**
 * 计算文件的 MD5 值（前 8 位）
 */
export async function calculateMD5(file: File | Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex.slice(0, 8);
}

/**
 * 将图片压缩并转换为 JPEG 格式
 * @param file 原始图片文件
 * @param maxSizeMB 最大文件大小（MB），默认 2MB
 * @returns 压缩后的 Blob
 */
export async function compressImage(
  file: File,
  maxSizeMB: number = 2
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // 计算压缩后的尺寸
      let { width, height } = img;
      const maxDimension = 1920; // 最大边长

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("无法创建 canvas context"));
        return;
      }

      // 白色背景（JPEG 不支持透明）
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // 转换为 JPEG，质量从 0.9 开始逐步降低直到文件大小符合要求
      let quality = 0.9;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("压缩失败"));
              return;
            }

            if (blob.size <= maxSizeBytes || quality <= 0.3) {
              resolve(blob);
            } else {
              quality -= 0.1;
              tryCompress();
            }
          },
          "image/jpeg",
          quality
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片加载失败"));
    };

    img.src = url;
  });
}

/**
 * 动态加载 COS SDK
 */
async function loadCOSSDK(): Promise<typeof import("cos-js-sdk-v5")> {
  if (COS) return COS;
  
  const mod = await import("cos-js-sdk-v5");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  COS = (mod as any).default || mod;
  return COS!;
}

/**
 * 处理图片并上传到 COS
 * @param file 原始图片文件
 * @param userId 用户ID
 * @param onProgress 进度回调
 * @returns 上传后的文件名（不包含路径）
 */
export async function processAndUploadImage(
  file: File,
  userId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  // 1. 压缩图片
  const compressedBlob = await compressImage(file, 2);

  // 2. 计算 MD5
  const md5Hash = await calculateMD5(compressedBlob);

  // 3. 生成文件名
  const filename = `atc-img-${md5Hash}.jpg`;

  // 4. 加载 COS SDK
  const COS = await loadCOSSDK();

  // 5. 获取临时密钥
  const { data, error } = await getCredential({});
  if (error || !data?.cosTempCredential) {
    throw new Error("获取临时密钥失败");
  }

  const cred = data.cosTempCredential;

  // 6. 创建 COS 实例
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cos = new COS({
    // @ts-ignore - SDK 类型定义问题
    getAuthorization: function (_options: unknown, callback: (data: unknown) => void) {
      callback({
        TmpSecretId: cred.secretId,
        TmpSecretKey: cred.secretKey,
        SecurityToken: cred.sessionToken ?? "",
        ExpiredTime: cred.expiredTime,
      });
    },
  });

  // 7. 上传到 COS
  // Bucket 名称格式: bucketName-appId
  const bucket = `${cred.bucketName}-${cred.appId}`;
  const region = cred.region;
  const key = `user-${userId}/image/${filename}`;

  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: bucket,
        Region: region,
        Key: key,
        Body: compressedBlob,
        onProgress: function (progressData: { percent: number }) {
          if (onProgress) {
            onProgress(Math.round(progressData.percent * 100));
          }
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function (err: any, data: any) {
        if (err) {
          reject(err);
        } else if (data.statusCode === 200) {
          resolve(filename);
        } else {
          reject(new Error("上传失败"));
        }
      }
    );
  });
}
