import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: keyof typeof Icons;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: keyof typeof Icons;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon = "fileText",
  title,
  description,
  action,
  className,
  size = "md"
}: EmptyStateProps) {
  const IconComponent = Icons[icon];
  const ActionIcon = action?.icon ? Icons[action.icon] : null;

  const sizeClasses = {
    sm: {
      container: "py-8",
      icon: "w-12 h-12",
      title: "text-lg",
      description: "text-sm"
    },
    md: {
      container: "py-12",
      icon: "w-16 h-16",
      title: "text-xl",
      description: "text-base"
    },
    lg: {
      container: "py-16",
      icon: "w-20 h-20",
      title: "text-2xl",
      description: "text-lg"
    }
  };

  return (
    <div className={cn(
      "text-center",
      sizeClasses[size].container,
      className
    )}>
      <div className={cn(
        "mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center",
        sizeClasses[size].icon
      )}>
        <IconComponent className={cn(
          "text-blue-600",
          size === "sm" && "w-6 h-6",
          size === "md" && "w-8 h-8",
          size === "lg" && "w-10 h-10"
        )} />
      </div>
      
      <h3 className={cn(
        "font-semibold text-foreground mb-3",
        sizeClasses[size].title
      )}>
        {title}
      </h3>
      
      {description && (
        <p className={cn(
          "text-muted-foreground mb-8 max-w-md mx-auto",
          sizeClasses[size].description
        )}>
          {description}
        </p>
      )}
      
      {action && (
        <Button 
          onClick={action.onClick}
          className="btn-modern bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0"
        >
          {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}