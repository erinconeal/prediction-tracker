'use client';

import { memo } from 'react';
import { usePredictionTopics } from '@/hooks/usePredictionTopics';
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
  const { primary, bucketParent, extraTopics, ready } = usePredictionTopics(topicIds);
  const extra = extraTopics.length;

  return (
    <div className={`${forecastCardMetaFooterClass} ${className}`.trim()}>
      <p className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1">
        {!ready
          ? null
          : (
              <>
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
              </>
            )}
      </p>
    </div>
  );
});
