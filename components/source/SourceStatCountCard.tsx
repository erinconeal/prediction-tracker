'use client';

import { useId, type ReactNode } from 'react';
import { InfoPopover } from '@/components/ui/InfoPopover';

export const sourceStatCardClass
  = 'rounded-xl border border-border bg-surface-elevated p-4 shadow-sm';

type SourceStatCountCardProps = {
  label: string;
  value: number | string;
  about?: {
    popoverLabel: string;
    hint: ReactNode;
  };
};

export function SourceStatCountCard({
  label,
  value,
  about,
}: SourceStatCountCardProps) {
  const labelId = useId();

  return (
    <div
      className={sourceStatCardClass}
      role="group"
      aria-labelledby={labelId}
    >
      {about
        ? (
            <div className="flex items-center justify-between gap-1">
              <p
                id={labelId}
                className="text-xs font-medium uppercase tracking-wide text-muted"
              >
                {label}
              </p>
              <InfoPopover label={about.popoverLabel}>{about.hint}</InfoPopover>
            </div>
          )
        : (
            <p
              id={labelId}
              className="text-xs font-medium uppercase tracking-wide text-muted"
            >
              {label}
            </p>
          )}
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}
