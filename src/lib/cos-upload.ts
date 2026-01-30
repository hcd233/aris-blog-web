"use client";

import { getCredential } from "@/lib/api/config";

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
 * COS 临时密钥信息
 */
interface CosCredential {
  appId: string;
  bucketName: string;
  region: string;
  secretId: string;
  secretKey: string;
  sessionToken: string;
  expiredTime: number;
}

let cachedCredential: CosCredential | null = null;
let credentialExpiryTime = 0;

/**
 * 获取 COS 临时密钥（带缓存）
 */
async function getCosCredential(): Promise<CosCredential> {
  // 如果缓存未过期，直接使用缓存
  const now = Math.floor(Date.now() / 1000);
  if (cachedCredential && credentialExpiryTime > now + 300) {
    return cachedCredential;
  }

  const { data, error } = await getCredential({});

  if (error) {
    throw new Error("获取临时密钥失败");
  }

  const cred = data?.cosTempCredential;
  if (!cred) {
    throw new Error("临时密钥数据异常");
  }

  cachedCredential = {
    appId: cred.appId,
    bucketName: cred.bucketName,
    region: cred.region,
    secretId: cred.secretId,
    secretKey: cred.secretKey,
    sessionToken: cred.sessionToken ?? "",
    expiredTime: cred.expiredTime,
  };

  credentialExpiryTime = cred.expiredTime;
  return cachedCredential;
}

/**
 * 生成 COS 请求签名
 * @param method HTTP 方法
 * @param pathname 对象路径
 * @param credential 临时密钥
 * @param headers 请求头
 */
function getCosSignature(
  method: string,
  pathname: string,
  credential: CosCredential,
  headers: Record<string, string> = {}
): string {
  const date = new Date();
  const dateString = date.toUTCString();
  const keyTime = `${Math.floor(date.getTime() / 1000)};${credential.expiredTime}`;

  // 构建签名头
  const headerList = Object.keys(headers).sort().join(";");
  const httpHeaders: Record<string, string> = {
    ...headers,
    host: `${credential.bucketName}.cos.${credential.region}.myqcloud.com`,
  };

  const headerString = Object.entries(httpHeaders)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  // 构建 HTTP 参数
  const uri = encodeURIComponent(pathname).replace(/%2F/g, "/");

  // 构建 StringToSign
  const stringToSign = [
    `sha1`,
    keyTime,
    `sha1(${method}\n${uri}\n\n${headerString}\n)`,
    "",
  ].join("\n");

  // 计算签名
  const signKey = hmacSha1(keyTime, credential.secretKey);
  const signature = hmacSha1(stringToSign, signKey);

  return `q-sign-algorithm=sha1&q-ak=${credential.secretId}&q-sign-time=${keyTime}&q-key-time=${keyTime}&q-header-list=${headerList}&q-url-param-list=&q-signature=${signature}`;
}

/**
 * HMAC-SHA1 计算
 */
function hmacSha1(message: string, key: string): string {
  // 使用 Web Crypto API
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);

  const cryptoKey = crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  return cryptoKey.then((key) =>
    crypto.subtle.sign("HMAC", key, messageData).then((signature) => {
      const array = Array.from(new Uint8Array(signature));
      return array.map((b) => b.toString(16).padStart(2, "0")).join("");
    })
  ) as unknown as string;
}

/**
 * 同步版本的 HMAC-SHA1（使用简单的字符串操作）
 */
function hmacSha1Sync(message: string, key: string): string {
  // 这是一个简化的版本，实际应该使用 crypto.subtle
  // 为了简化，这里我们使用 base64 编码的字符串作为签名
  const encoder = new TextEncoder();
  const combined = encoder.encode(`${key}:${message}`);
  return btoa(String.fromCharCode(...combined));
}

/**
 * 上传文件到 COS
 * @param file 文件 Blob
 * @param filename 文件名（不包含路径）
 * @param userId 用户ID
 * @param onProgress 进度回调
 */
export async function uploadToCos(
  file: Blob,
  filename: string,
  userId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const credential = await getCosCredential();
  const bucket = credential.bucketName;
  const region = credential.region;
  const appId = credential.appId;
  const key = `user-${userId}/image/${filename}`;

  const url = `https://${bucket}-${appId}.cos.${region}.myqcloud.com/${key}`;

  // 生成签名
  const headers: Record<string, string> = {
    "content-type": "image/jpeg",
  };
  const signature = await generateCosSignature(
    "PUT",
    `/${key}`,
    credential,
    headers
  );

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // 返回完整的 URL
        resolve(url);
      } else {
        reject(new Error(`上传失败: ${xhr.status} ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("网络错误"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("上传已取消"));
    });

    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Authorization", signature);
    xhr.setRequestHeader("x-cos-security-token", credential.sessionToken);
    xhr.setRequestHeader("content-type", "image/jpeg");
    xhr.send(file);
  });
}

/**
 * 生成 COS 签名（异步版本）
 */
async function generateCosSignature(
  method: string,
  pathname: string,
  credential: CosCredential,
  headers: Record<string, string> = {}
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const keyTime = `${now};${credential.expiredTime}`;

  // 构建签名头列表
  const headerKeys = Object.keys(headers).map((k) => k.toLowerCase()).sort();
  const headerList = headerKeys.join(";");

  // 构建 HTTP 头字符串
  const httpHeaders: Record<string, string> = {};
  headerKeys.forEach((k) => {
    const value = headers[k] || headers[k.toLowerCase()];
    if (value) {
      httpHeaders[k] = value;
    }
  });

  // 必须包含 host 头
  const host = `${credential.bucketName}.cos.${credential.region}.myqcloud.com`;
  if (!httpHeaders["host"]) {
    httpHeaders["host"] = host;
  }

  const headerString = Object.entries(httpHeaders)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");

  // 构建 HTTP 参数字符串（这里是空的）
  const urlParamList = "";
  const httpParameters = "";

  // 构建 StringToSign
  const formatSignString = [
    method.toLowerCase(),
    pathname,
    httpParameters,
    headerString,
    "",
  ].join("\n");

  // 计算 SignKey
  const signKey = await hmacSha1Async(keyTime, credential.secretKey);

  // 计算 HttpString 的 hash
  const httpStringHash = await sha1Async(formatSignString);

  // 构建 StringToSign
  const stringToSign = `sha1\n${keyTime}\n${httpStringHash}\n`;

  // 计算最终签名
  const signature = await hmacSha1Async(stringToSign, signKey);

  return `q-sign-algorithm=sha1&q-ak=${credential.secretId}&q-sign-time=${keyTime}&q-key-time=${keyTime}&q-header-list=${headerList}&q-url-param-list=${urlParamList}&q-signature=${signature}`;
}

/**
 * 异步 HMAC-SHA1
 */
async function hmacSha1Async(
  message: string,
  key: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const array = Array.from(new Uint8Array(signature));
  return array.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * 异步 SHA1
 */
async function sha1Async(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
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

  // 4. 上传到 COS
  await uploadToCos(compressedBlob, filename, userId, onProgress);

  return filename;
}
