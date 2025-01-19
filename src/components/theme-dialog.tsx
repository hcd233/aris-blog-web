"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ThemeOption {
  value: string
  label: string
  icon: React.ReactNode
  description: string
}

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    label: '浅色',
    icon: <Sun className="h-5 w-5" />,
    description: '适合日间使用的明亮主题'
  },
  {
    value: 'dark',
    label: '深色',
    icon: <Moon className="h-5 w-5" />,
    description: '适合夜间使用的暗色主题'
  },
  {
    value: 'system',
    label: '系统',
    icon: <Monitor className="h-5 w-5" />,
    description: '跟随系统设置自动切换'
  }
]

export function ThemeDialog() {
  const { theme, setTheme } = useTheme()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-muted/50">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">切换主题</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="end">
        <Card className="glass-effect border-none">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold">外观设置</CardTitle>
            <CardDescription>
              选择你喜欢的主题模式
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {themeOptions.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                className={cn(
                  "w-full h-auto p-4 justify-start gap-4 hover:bg-muted/50 group relative overflow-hidden",
                  theme === option.value && "border-primary"
                )}
                onClick={() => setTheme(option.value)}
              >
                <div className="relative z-10 flex items-center gap-4 w-full">
                  <div className={cn(
                    "transition-colors",
                    theme === option.value ? "text-primary" : "group-hover:text-primary"
                  )}>
                    {option.icon}
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.025] to-transparent group-hover:via-foreground/[0.075] -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
            ))}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
} 