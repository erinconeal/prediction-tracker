'use client';

import { memo, type ReactNode } from 'react';
import {
  forecastCardShellClass,
} from './forecast-card-tokens';

type ForecastCardShellProps = {
  header?: ReactNode;
  title: ReactNode;
  afterTitle?: ReactNode;
  footer: ReactNode;
  className?: string;
  /** When false, title renders without an wrapping h3 (e.g. title row with badge). */
  wrapTitleInHeading?: boolean;
};

export const ForecastCardShell = memo(function ForecastCardShell({
  header,
  title,
  afterTitle,
  footer,
  className = '',
  wrapTitleInHeading = true,
}: ForecastCardShellProps) {
  const titleBlock = wrapTitleInHeading
    ? <h3 className="min-h-0">{title}</h3>
    : <div className="min-h-0">{title}</div>;

  return (
    <article
      className={`${forecastCardShellClass} ${className}`.trim()}
    >
      {header ?? null}
      <div
        className={`flex min-h-[3.25rem] flex-1 flex-col ${header ? 'mt-4' : ''}`.trim()}
      >
        {titleBlock}
        {afterTitle ? <div className="mt-2">{afterTitle}</div> : null}
      </div>
      {footer}
    </article>
  );
});
