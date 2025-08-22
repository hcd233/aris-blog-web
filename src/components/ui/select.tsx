"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface SelectProps {
  value?: string | number;
  onValueChange?: (value: string | number) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  className,
  disabled = false,
}: SelectProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between font-normal",
            !selectedOption && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <Icons.chevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full p-0" align="start">
        <div className="max-h-60 overflow-y-auto">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => {
                onValueChange?.(option.value);
                setOpen(false);
              }}
              className="cursor-pointer"
            >
              {option.label}
            </DropdownMenuItem>
          ))}
          {options.length === 0 && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
              No options found
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}