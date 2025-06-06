"use client";

import { useState } from "react";
import { appConfig } from "@/config/app";

interface AppIconProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
};

export default function AppIcon({ size = "md", className = "" }: AppIconProps) {
  const [imageError, setImageError] = useState(false);
  const sizeClass = sizeClasses[size];
  const textSizeClass = textSizeClasses[size];

  // 如果有自定义图标URL且图片加载成功，显示自定义图标
  if (appConfig.iconUrl && !imageError) {
    return (
      <img
        src={appConfig.iconUrl}
        alt={`${appConfig.name} Icon`}
        className={`${sizeClass} rounded-lg object-cover ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  // 否则显示默认的字母图标
  return (
    <div
      className={`${sizeClass} bg-gradient-to-r ${appConfig.defaultIcon.gradient} rounded-lg flex items-center justify-center ${className}`}
    >
      <span className={`text-white font-bold ${textSizeClass}`}>
        {appConfig.defaultIcon.letter}
      </span>
    </div>
  );
}
