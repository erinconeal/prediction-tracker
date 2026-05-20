'use client';

import { memo } from 'react';
import type { Prediction, TerminalOutcome } from '@/types/prediction';
import { truncateWithEllipsis } from '@/utils/truncate-text';
import { PredictionCard } from './PredictionCard';

type PredictionListProps = {
  predictions: Prediction[];
  loading: boolean;
  onOutcomeChange: (
    id: string,
    outcome: TerminalOutcome,
  ) => Promise<void>;
  emptyMessage?: string;
};

const secondaryBtn
  = 'rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export const PredictionList = memo(function PredictionList({
  predictions,
  loading,
  onOutcomeChange,
  emptyMessage = 'No predictions match these filters.',
}: PredictionListProps) {
  if (loading && predictions.length === 0) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading predictions">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl bg-surface"
          />
        ))}
      </div>
    );
  }

  if (!loading && predictions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {predictions.map(p => (
        <li key={p.id} className="list-none">
          <PredictionCard
            prediction={p}
            size="compact"
            showCreatedAt
            footerSlot={
              p.outcome === 'pending'
                ? (
                    <div className="flex max-w-md flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        className={secondaryBtn}
                        aria-label={`Mark as correct: ${truncateWithEllipsis(p.text, 80)}`}
                        onClick={() => void onOutcomeChange(p.id, 'correct')}
                      >
                        Mark correct
                      </button>
                      <button
                        type="button"
                        className={secondaryBtn}
                        aria-label={`Mark as incorrect: ${truncateWithEllipsis(p.text, 80)}`}
                        onClick={() => void onOutcomeChange(p.id, 'incorrect')}
                      >
                        Mark incorrect
                      </button>
                      <button
                        type="button"
                        className={secondaryBtn}
                        aria-label={`Mark as unresolved: ${truncateWithEllipsis(p.text, 80)}`}
                        onClick={() => void onOutcomeChange(p.id, 'unresolved')}
                      >
                        Mark unresolved
                      </button>
                      <button
                        type="button"
                        className={secondaryBtn}
                        aria-label={`Mark as invalid: ${truncateWithEllipsis(p.text, 80)}`}
                        onClick={() => void onOutcomeChange(p.id, 'invalid')}
                      >
                        Mark invalid
                      </button>
                    </div>
                  )
                : null
            }
          />
        </li>
      ))}
    </ul>
  );
});
