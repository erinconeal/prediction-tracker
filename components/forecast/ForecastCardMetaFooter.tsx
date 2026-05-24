'use client';

import Link from 'next/link';
import { memo } from 'react';
import { useTopicCatalog } from '@/hooks/useTopicCatalog';
import { truncateWithEllipsis } from '@/utils/truncate-text';
import { ForecastCategoryLink } from './ForecastCategoryLink';
import { forecastCardLinkClass, forecastCardMetaFooterClass } from './forecast-card-tokens';

type ForecastCardMetaFooterProps = {
  category: string | null | undefined;
  topicIds?: string[];
  className?: string;
};

const topicLinkClass
  = `inline min-h-11 items-center font-normal text-muted ${forecastCardLinkClass}`;

export const ForecastCardMetaFooter = memo(function ForecastCardMetaFooter({
  category,
  topicIds = [],
  className = '',
}: ForecastCardMetaFooterProps) {
  const { getTopicsByIds } = useTopicCatalog();
  const topics = getTopicsByIds(topicIds);
  const primary = topics[0];
  const extra = topics.length - 1;

  return (
    <div className={`${forecastCardMetaFooterClass} ${className}`.trim()}>
      <p className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1">
        <ForecastCategoryLink category={category} />
        {primary
          ? (
              <>
                <span className="text-muted" aria-hidden>
                  ·
                </span>
                <Link
                  href={`/topics/${primary.slug}`}
                  className={topicLinkClass}
                >
                  {truncateWithEllipsis(primary.name, 48)}
                </Link>
                {extra > 0
                  ? (
                      <span className="text-muted">
                        +
                        {extra}
                      </span>
                    )
                  : null}
              </>
            )
          : null}
      </p>
    </div>
  );
});
