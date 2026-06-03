'use client';

import type { ReactNode } from 'react';
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
  return (
    <div className={sourceStatCardClass}>
      {about
        ? (
            <div className="flex items-center justify-between gap-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {label}
              </p>
              <InfoPopover label={about.popoverLabel}>{about.hint}</InfoPopover>
            </div>
          )
        : (
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {label}
            </p>
          )}
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}
