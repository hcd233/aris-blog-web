import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
}

interface InputFieldProps extends FormFieldProps, React.InputHTMLAttributes<HTMLInputElement> {
  type?: "text" | "email" | "password" | "url" | "number";
}

interface TextareaFieldProps extends FormFieldProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  rows?: number;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, required = false, error, className, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", className)}>
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          ref={ref}
          {...props}
          className={cn(
            "border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200",
            error && "border-red-300 focus:border-red-400 focus:ring-red-200",
            props.className
          )}
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, required = false, error, className, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", className)}>
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Textarea
          ref={ref}
          {...props}
          className={cn(
            "border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200 resize-none",
            error && "border-red-300 focus:border-red-400 focus:ring-red-200",
            props.className
          )}
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

TextareaField.displayName = "TextareaField";