import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "pulse" | "wave";
  className?: string;
  text?: string;
}

export function Loading({ 
  size = "md", 
  variant = "spinner", 
  className,
  text 
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const renderSpinner = () => (
    <div className={cn("relative", sizeClasses[size])}>
      <div className="w-full h-full rounded-full border-2 border-muted animate-spin">
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-transparent border-t-primary"></div>
      </div>
    </div>
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-primary rounded-full animate-bounce",
            size === "sm" && "w-1 h-1",
            size === "md" && "w-1.5 h-1.5", 
            size === "lg" && "w-2 h-2",
            size === "xl" && "w-3 h-3"
          )}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={cn(
      "rounded-full bg-primary animate-pulse",
      sizeClasses[size]
    )} />
  );

  const renderWave = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-primary rounded-full animate-pulse",
            size === "sm" && "w-1 h-3",
            size === "md" && "w-1 h-4",
            size === "lg" && "w-1.5 h-6", 
            size === "xl" && "w-2 h-8"
          )}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      case "wave":
        return renderWave();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      {renderContent()}
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
}

export function LoadingPage({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <Icons.spinner className="h-8 w-8 animate-spin text-white" />
          </div>
          <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-ping opacity-20"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">{text}</h2>
          <p className="text-muted-foreground">Please wait while we prepare everything for you</p>
        </div>
      </div>
    </div>
  );
}

export function LoadingCard({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <Loading size="lg" variant="spinner" />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}