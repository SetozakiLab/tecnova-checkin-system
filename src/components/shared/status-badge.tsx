import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  isActive: boolean;
  activeText?: string;
  inactiveText?: string;
  className?: string;
}

export function StatusBadge({
  isActive,
  activeText = "滞在中",
  inactiveText = "退場済み",
  className = "",
}: StatusBadgeProps) {
  return (
    <Badge
      variant={isActive ? "default" : "secondary"}
      className={`${
        isActive ? "bg-green-100 text-green-800" : ""
      } ${className}`}
    >
      {isActive ? activeText : inactiveText}
    </Badge>
  );
}
