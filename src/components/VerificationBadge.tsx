import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertTriangle } from "lucide-react";
import { useState } from "react";

type VerificationStatus = "true" | "false" | "partial";

interface VerificationBadgeProps {
  status: VerificationStatus;
  className?: string;
  showIcon?: boolean;
  showTooltip?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  status, 
  className,
  showIcon = true,
  showTooltip = false,
  size = "md",
  onClick
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  
  const statusText = {
    true: "Vérifié Vrai",
    false: "Vérifié Faux",
    partial: "Partiellement Vrai"
  };

  const statusDetails = {
    true: "Cette information a été vérifiée et confirmée comme étant vraie.",
    false: "Cette information a été vérifiée et confirmée comme étant fausse.",
    partial: "Cette information contient des éléments vrais et des éléments faux ou trompeurs."
  };

  const statusStyles = {
    true: "verification-badge-true",
    false: "verification-badge-false",
    partial: "verification-badge-partial"
  };

  const StatusIcon = {
    true: Check,
    false: X,
    partial: AlertTriangle
  }[status];

  const sizeStyles = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  const handleMouseEnter = () => {
    if (showTooltip) setIsTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    if (showTooltip) setIsTooltipVisible(false);
  };

  return (
    <div className="relative inline-block">
      <Badge 
        variant="outline"
        className={cn(
          "font-medium rounded-full border flex items-center gap-1.5 transition-colors verification-badge",
          statusStyles[status],
          sizeStyles[size],
          onClick ? "cursor-pointer" : showTooltip ? "cursor-help" : "",
          className
        )}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {showIcon && <StatusIcon className={cn("h-4 w-4", size === "lg" ? "h-5 w-5" : "")} />}
        {statusText[status]}
      </Badge>
      
      {showTooltip && isTooltipVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-background text-foreground text-xs rounded shadow-lg w-60 z-10 animate-fade-in dark:bg-primary dark:text-primary-foreground">
          <div className="relative">
            {statusDetails[status]}
            <div className="absolute w-2 h-2 bg-background dark:bg-primary rotate-45 bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1"></div>
          </div>
        </div>
      )}
    </div>
  );
};
