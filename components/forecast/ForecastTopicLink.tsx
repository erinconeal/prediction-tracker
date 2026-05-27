'use client';

import Link from 'next/link';
import { memo } from 'react';
import { topicDisplayFromName } from '@/lib/topic-display';
import type { Topic } from '@/types/topic';
import { forecastCardLinkClass } from './forecast-card-tokens';

type ForecastTopicLinkProps = {
  topic: Topic | null | undefined;
  className?: string;
};

const linkClass
  = `inline-flex items-center text-xs font-normal uppercase text-muted ${forecastCardLinkClass}`;

const staticClass = 'text-xs font-normal uppercase text-muted';

export const ForecastTopicLink = memo(function ForecastTopicLink({
  topic,
  className = '',
}: ForecastTopicLinkProps) {
  const display = topicDisplayFromName(topic?.name);
  const href = topic ? `/topics/${topic.slug}` : undefined;

  if (href) {
    return (
      <Link
        href={href}
        className={`${linkClass} ${className}`.trim()}
        aria-label={`Browse ${topic!.name} forecasts`}
      >
        {display.label}
      </Link>
    );
  }

  return (
    <span className={`${staticClass} ${className}`.trim()}>
      {display.label}
    </span>
  );
});
