import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = "md",
  text = "Chargement...",
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const Container = ({ children }: { children: React.ReactNode }) => {
    if (fullScreen) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          {children}
        </div>
      );
    }
    return (
      <div className={cn("flex flex-col items-center justify-center", className)}>
        {children}
      </div>
    );
  };

  return (
    <Container>
      <Loader2 className={cn("animate-spin text-primary", sizeMap[size])} />
      {text && (
        <p className={cn("mt-2 text-center text-muted-foreground", {
          "text-sm": size === "sm",
          "text-base": size === "md",
          "text-lg": size === "lg",
        })}>
          {text}
        </p>
      )}
    </Container>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm animate-pulse">
      <div className="flex flex-col space-y-3">
        <div className="h-4 w-3/4 rounded bg-muted"></div>
        <div className="space-y-2">
          <div className="h-4 rounded bg-muted"></div>
          <div className="h-4 rounded bg-muted"></div>
          <div className="h-4 w-4/5 rounded bg-muted"></div>
        </div>
        <div className="h-8 w-1/3 rounded bg-muted"></div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
} 