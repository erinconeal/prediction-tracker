'use client';

import { memo, type ReactNode } from 'react';
import {
  forecastCardShellClass,
} from './forecast-card-tokens';

type ForecastCardShellProps = {
  header: ReactNode;
  title: ReactNode;
  afterTitle?: ReactNode;
  footer: ReactNode;
  className?: string;
};

export const ForecastCardShell = memo(function ForecastCardShell({
  header,
  title,
  afterTitle,
  footer,
  className = '',
}: ForecastCardShellProps) {
  return (
    <article
      className={`${forecastCardShellClass} ${className}`.trim()}
    >
      {header}
      <div className="mt-4 flex min-h-[3.25rem] flex-1 flex-col">
        <h3 className="min-h-0">{title}</h3>
        {afterTitle ? <div className="mt-2">{afterTitle}</div> : null}
      </div>
      {footer}
    </article>
  );
});
