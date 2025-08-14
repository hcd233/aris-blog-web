import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: keyof typeof Icons;
}

interface NavigationProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function Navigation({
  title,
  description,
  breadcrumbs,
  actions,
  className
}: NavigationProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          {breadcrumbs.map((item, index) => {
            const IconComponent = item.icon ? Icons[item.icon] : null;
            const isLast = index === breadcrumbs.length - 1;
            
            return (
              <div key={index} className="flex items-center space-x-2">
                {index > 0 && (
                  <Icons.chevronRight className="w-4 h-4" />
                )}
                {item.href && !isLast ? (
                  <a
                    href={item.href}
                    className="flex items-center space-x-1 hover:text-foreground transition-colors"
                  >
                    {IconComponent && <IconComponent className="w-4 h-4" />}
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <div className="flex items-center space-x-1">
                    {IconComponent && <IconComponent className="w-4 h-4" />}
                    <span className={isLast ? "text-foreground font-medium" : ""}>
                      {item.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      )}
      
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}