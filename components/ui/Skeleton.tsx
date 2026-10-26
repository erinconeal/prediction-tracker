type SkeletonTone = 'surface' | 'elevated' | 'onPrimary';

type SkeletonProps = {
  className?: string;
  tone?: SkeletonTone;
};

const toneClass: Record<SkeletonTone, string> = {
  surface: 'bg-surface',
  elevated: 'bg-surface-elevated',
  onPrimary: 'bg-white/20',
};

export function Skeleton({
  className = '',
  tone = 'surface',
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse motion-reduce:animate-none ${toneClass[tone]} ${className}`.trim()}
    />
  );
}
