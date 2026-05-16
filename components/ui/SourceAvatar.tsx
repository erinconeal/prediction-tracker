import { memo } from "react";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

type SourceAvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClass = {
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-16 text-lg",
} as const;

export const SourceAvatar = memo(function SourceAvatar({
  name,
  size = "md",
  className = "",
}: SourceAvatarProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 border-border bg-surface font-semibold text-ink ${sizeClass[size]} ${className}`.trim()}
      aria-hidden
    >
      {initialsFromName(name)}
    </span>
  );
});
