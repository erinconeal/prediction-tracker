'use client';

import { memo } from 'react';
import { formatIsoDate } from '@/utils/format-date';

type ForecastCardTimingSubtitleProps = {
  label: string;
  iso: string;
};

export const ForecastCardTimingSubtitle = memo(
  function ForecastCardTimingSubtitle({
    label,
    iso,
  }: ForecastCardTimingSubtitleProps) {
    return (
      <p className="text-sm text-muted">
        <span className="font-medium text-foreground">{label}</span>
        {' · '}
        <time dateTime={iso}>{formatIsoDate(iso)}</time>
      </p>
    );
  },
);
