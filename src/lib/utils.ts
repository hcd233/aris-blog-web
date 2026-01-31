import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const gradients = [
  "from-purple-500/20 to-blue-500/20",
  "from-pink-500/20 to-rose-500/20",
  "from-emerald-500/20 to-teal-500/20",
  "from-orange-500/20 to-red-500/20",
  "from-cyan-500/20 to-blue-500/20",
  "from-violet-500/20 to-purple-500/20",
]

export function getGradient(id: number): string {
  return gradients[id % gradients.length]
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return "刚刚"
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 4) return `${days}天前`

  const nowYear = now.getFullYear()
  const dateYear = date.getFullYear()

  if (dateYear === nowYear) {
    return date.toLocaleDateString("zh-CN", { month: "long", day: "numeric" })
  }

  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })
}

export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = url
  })
}

export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = reject
    img.src = url
  })
}

export function calculateImageHeight(
  naturalWidth: number,
  naturalHeight: number,
  containerWidth: number,
  minHeight: number = 200,
  maxHeight: number = 600
): number {
  const aspectRatio = naturalHeight / naturalWidth
  let height = containerWidth * aspectRatio

  if (height < minHeight) height = minHeight
  if (height > maxHeight) height = maxHeight

  return Math.round(height)
}

export function handleApiError(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    return error.message
  }
  return defaultMessage
}
