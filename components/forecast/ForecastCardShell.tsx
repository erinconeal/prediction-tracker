'use client';

import { memo, type ReactNode } from 'react';
import {
  forecastCardHeaderClass,
  forecastCardShellClass,
} from './forecast-card-tokens';

type ForecastCardShellProps = {
  headerStart: ReactNode;
  headerEnd: ReactNode;
  title: ReactNode;
  footer: ReactNode;
  className?: string;
};

export const ForecastCardShell = memo(function ForecastCardShell({
  headerStart,
  headerEnd,
  title,
  footer,
  className = '',
}: ForecastCardShellProps) {
  return (
    <article
      className={`${forecastCardShellClass} ${className}`.trim()}
    >
      <div className={forecastCardHeaderClass}>
        <div className="min-w-0 flex-1">{headerStart}</div>
        <div className="shrink-0">{headerEnd}</div>
      </div>
      <h3 className="mt-4 min-h-[3.25rem] flex-1">{title}</h3>
      {footer}
    </article>
  );
});
