'use client';

import Link from 'next/link';
import { memo } from 'react';
import { forecastCardLinkClass, forecastCardTitleClass } from './forecast-card-tokens';

type ForecastCardTitleProps = {
  predictionId: string;
  text: string;
};

export const ForecastCardTitle = memo(function ForecastCardTitle({
  predictionId,
  text,
}: ForecastCardTitleProps) {
  return (
    <Link
      href={`/predictions/${encodeURIComponent(predictionId)}`}
      className={`${forecastCardTitleClass} ${forecastCardLinkClass}`}
    >
      {text}
    </Link>
  );
});
