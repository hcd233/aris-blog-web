"use client";

import { useState, useEffect } from "react";
import { preloadImage } from "@/lib/utils";

interface UseImagePreloadOptions {
  urls: string[];
  enabled?: boolean;
}

interface UseImagePreloadReturn {
  loaded: boolean;
  loading: boolean;
  progress: number;
}

export function useImagePreload(options: UseImagePreloadOptions): UseImagePreloadReturn {
  const { urls, enabled = true } = options;
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled || urls.length === 0) {
      setLoaded(true);
      setLoading(false);
      setProgress(100);
      return;
    }

    setLoading(true);
    setLoaded(false);
    setProgress(0);

    let completed = 0;
    const total = urls.length;

    const loadImages = async () => {
      await Promise.all(
        urls.map(async (url) => {
          await preloadImage(url);
          completed++;
          setProgress(Math.round((completed / total) * 100));
        })
      );
      setLoaded(true);
      setLoading(false);
    };

    loadImages();
  }, [urls, enabled]);

  return { loaded, loading, progress };
}
