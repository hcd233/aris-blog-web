import { Icons } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: keyof typeof Icons;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  className?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  variant = "default"
}: StatCardProps) {
  const IconComponent = icon ? Icons[icon] : null;

  const variantStyles = {
    default: {
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-500",
      iconColor: "text-white",
      border: "border-primary/20"
    },
    success: {
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-500",
      iconColor: "text-white",
      border: "border-green-500/20"
    },
    warning: {
      iconBg: "bg-gradient-to-br from-yellow-500 to-orange-500",
      iconColor: "text-white",
      border: "border-yellow-500/20"
    },
    danger: {
      iconBg: "bg-gradient-to-br from-red-500 to-pink-500",
      iconColor: "text-white",
      border: "border-red-500/20"
    }
  };

  const styles = variantStyles[variant];

  return (
    <Card className={cn("glass card-hover", styles.border, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {IconComponent && (
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", styles.iconBg)}>
            <IconComponent className={cn("w-4 h-4", styles.iconColor)} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-foreground">
            {value}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
          {trend && (
            <div className="flex items-center space-x-1">
              <Icons.trendingUp className={cn(
                "w-3 h-3",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )} />
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}