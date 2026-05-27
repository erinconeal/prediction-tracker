'use client';

import { memo } from 'react';
import { useTopicCatalog } from '@/hooks/useTopicCatalog';
import { pickDisplayBucketTopic } from '@/lib/topic-primary';
import { ForecastTopicLink } from './ForecastTopicLink';
import { forecastCardMetaFooterClass } from './forecast-card-tokens';

type ForecastCardMetaFooterProps = {
  topicIds?: string[];
  className?: string;
};

export const ForecastCardMetaFooter = memo(function ForecastCardMetaFooter({
  topicIds = [],
  className = '',
}: ForecastCardMetaFooterProps) {
  const {
    getTopicsByIds,
    getPrimaryTopicForPrediction,
    getParentBucketTopics,
  } = useTopicCatalog();
  const topics = getTopicsByIds(topicIds);
  const primary = getPrimaryTopicForPrediction(topicIds);
  const bucketParent = primary
    ? pickDisplayBucketTopic(
        topics,
        primary,
        getParentBucketTopics(primary),
      )
    : null;
  const extraTopics = topics.filter(
    t => t.id !== primary?.id && t.id !== bucketParent?.id,
  );
  const extra = extraTopics.length;

  return (
    <div className={`${forecastCardMetaFooterClass} ${className}`.trim()}>
      <p className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1">
        {bucketParent
          ? (
              <>
                <ForecastTopicLink topic={bucketParent} />
                <span className="text-muted" aria-hidden>
                  ·
                </span>
              </>
            )
          : null}
        <ForecastTopicLink topic={primary} />
        {extraTopics[0]
          ? (
              <>
                <span className="text-muted" aria-hidden>
                  ·
                </span>
                <ForecastTopicLink topic={extraTopics[0]} />
                {extra > 1
                  ? (
                      <span className="text-muted">
                        +
                        {extra - 1}
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
