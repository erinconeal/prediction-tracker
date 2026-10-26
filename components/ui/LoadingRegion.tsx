import type { ElementType, ReactNode, Ref } from 'react';

type LoadingRegionTag = 'div' | 'ul' | 'aside';

type LoadingRegionElement = {
  div: HTMLDivElement;
  ul: HTMLUListElement;
  aside: HTMLElement;
};

type LoadingRegionProps<T extends LoadingRegionTag> = {
  label: string;
  children: ReactNode;
  className?: string;
  as?: T;
  ref?: Ref<LoadingRegionElement[T]>;
};

export function LoadingRegion<T extends LoadingRegionTag = 'div'>({
  label,
  children,
  className = '',
  as,
  ref,
}: LoadingRegionProps<T>) {
  const Tag = (as ?? 'div') as ElementType;

  return (
    <Tag
      ref={ref}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className={className || undefined}
    >
      {children}
    </Tag>
  );
}
