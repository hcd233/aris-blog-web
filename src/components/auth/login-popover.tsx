"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { LoginCard } from "./login-card"

interface LoginPopoverProps {
  trigger?: React.ReactNode
  align?: "start" | "center" | "end"
}

export function LoginPopover({ trigger, align = "end" }: LoginPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || <Button variant="outline">登录</Button>}
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align={align}>
        <LoginCard />
      </PopoverContent>
    </Popover>
  )
} 