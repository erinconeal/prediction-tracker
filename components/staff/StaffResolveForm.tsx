'use client';

import { useRef, useState } from 'react';

import { judgePredictionOutcome } from '@/lib/prediction-outcome';
import type { Prediction, TerminalOutcome } from '@/types/prediction';
import { isHttpOrHttpsUrl } from '@/utils/form-helpers';
import { formatIsoDate } from '@/utils/format-date';

import { FieldError } from './FieldError';
import { staffFieldClassName } from './staff-field-class';
import { StaffPassword } from './StaffPassword';
import { StaffResolveActionButton } from './StaffResolveActionButton';

type StaffResolveFormProps = {
  onResolved: (id: string) => void;
  update: (predictionId: string, outcome: TerminalOutcome, { staffSecret, resolutionUrl }: { staffSecret: string; resolutionUrl: string | null }) => Promise<Prediction | null>;
  refetch: () => Promise<void>;
  updateLoading: boolean;
  rows: Prediction[];
};

export function StaffResolveForm({ onResolved, update, refetch, updateLoading, rows }: StaffResolveFormProps) {
  const [fieldErrors, setFieldErrors] = useState<{ staffSecret?: string; resolutionUrlById: Record<string, string> }>({ resolutionUrlById: {} });
  const staffSecretInputRef = useRef<HTMLInputElement>(null);

  const splitOpenPredictions = (rows: Prediction[], now: Date) => {
    const readyToScore: Prediction[] = [];
    const readyMissingDeadline: Prediction[] = [];
    const waiting: Prediction[] = [];
    rows.forEach((row) => {
      const outcome = judgePredictionOutcome({
        currentOutcome: row.outcome,
        requestedOutcome: 'unresolved',
        targetDate: row.target_date,
        resolutionUrl: null,
        now,
      });
      if (outcome.reason === 'allowed') {
        readyToScore.push(row);
      }
      else if (outcome.reason === 'missing_deadline') {
        readyMissingDeadline.push(row);
      }
      else if (outcome.reason === 'deadline_not_passed') {
        waiting.push(row);
      }
    });
    return { readyToScore, readyMissingDeadline, waiting };
  };

  const { readyToScore, readyMissingDeadline, waiting } = splitOpenPredictions(rows, new Date());

  const resolvePrediction = async (
    predictionId: string,
    outcome: TerminalOutcome,
    resolutionUrl: string | null = null,
  ) => {
    onResolved('');
    const staffSecret = staffSecretInputRef.current?.value ?? '';
    if (!staffSecret) {
      setFieldErrors({ staffSecret: 'Staff password is required', resolutionUrlById: {} });
      document.getElementById('staffSecret')?.focus();
      return;
    }

    if ((outcome === 'correct' || outcome === 'incorrect') && !isHttpOrHttpsUrl(resolutionUrl ?? '')) {
      setFieldErrors({ resolutionUrlById: { [predictionId]: 'Resolution URL must be an http or https link' } });
      document.getElementById(`resolutionUrl-${predictionId}`)?.focus();
      return;
    }

    setFieldErrors({ resolutionUrlById: {} });
    const updated = await update(predictionId, outcome, { staffSecret, resolutionUrl });
    if (!updated) return;
    await refetch();
    onResolved(updated.id);
  };

  const readResolutionUrl = (predictionId: string) => {
    const input = document.getElementById(`resolutionUrl-${predictionId}`);
    if (!(input instanceof HTMLInputElement)) return null;
    const value = input.value.trim();
    return value || null;
  };

  return (
    <div className="max-w-3xl rounded-md bg-surface-elevated border border-border p-6">
      <div className="space-y-6">
        <StaffPassword ref={staffSecretInputRef} fieldErrors={fieldErrors} />
      </div>
      <section aria-labelledby="ready-heading" className="mt-12 space-y-4">
        <h2 id="ready-heading" className="font-serif text-2xl font-normal tracking-tight text-foreground">Ready</h2>
        <ul className="space-y-8">
          {readyMissingDeadline.map(prediction => (
            <li key={prediction.id}>
              <div>{prediction.text}</div>
              {prediction.source ? <a href={prediction.source} target="_blank" rel="noopener noreferrer" className="font-medium text-interactive underline underline-offset-2">{prediction.source}</a> : null}
              <div className="mt-2 flex flex-wrap gap-2">
                <StaffResolveActionButton
                  outcome="invalid"
                  disabled={updateLoading}
                  onClick={() => void resolvePrediction(prediction.id, 'invalid')}
                >
                  Mark invalid
                </StaffResolveActionButton>
              </div>
            </li>
          ))}
          {readyToScore.map((prediction) => {
            const urlError = fieldErrors.resolutionUrlById[prediction.id];
            return (
              <li key={prediction.id}>
                <div>{prediction.text}</div>
                {prediction.source ? <a href={prediction.source} target="_blank" rel="noopener noreferrer" className="font-medium text-interactive underline underline-offset-2">{prediction.source}</a> : null}
                <div className="mt-2">
                  <label htmlFor={`resolutionUrl-${prediction.id}`}>Resolution URL</label>
                  <input
                    id={`resolutionUrl-${prediction.id}`}
                    type="url"
                    className={staffFieldClassName}
                    aria-invalid={urlError ? true : undefined}
                    aria-describedby={urlError ? `resolutionUrlError-${prediction.id}` : undefined}
                  />
                  <FieldError id={`resolutionUrlError-${prediction.id}`} message={urlError} />
                  <div className="flex flex-wrap gap-2">
                    <StaffResolveActionButton
                      outcome="correct"
                      disabled={updateLoading}
                      onClick={() => void resolvePrediction(
                        prediction.id,
                        'correct',
                        readResolutionUrl(prediction.id),
                      )}
                    >
                      Mark correct
                    </StaffResolveActionButton>
                    <StaffResolveActionButton
                      outcome="incorrect"
                      disabled={updateLoading}
                      onClick={() => void resolvePrediction(
                        prediction.id,
                        'incorrect',
                        readResolutionUrl(prediction.id),
                      )}
                    >
                      Mark incorrect
                    </StaffResolveActionButton>
                    <StaffResolveActionButton
                      outcome="unresolved"
                      disabled={updateLoading}
                      onClick={() => void resolvePrediction(prediction.id, 'unresolved')}
                    >
                      Mark unresolved
                    </StaffResolveActionButton>
                    <StaffResolveActionButton
                      outcome="invalid"
                      disabled={updateLoading}
                      onClick={() => void resolvePrediction(prediction.id, 'invalid')}
                    >
                      Mark invalid
                    </StaffResolveActionButton>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
      <section aria-labelledby="waiting-heading" className="mt-12 space-y-4">
        <h2 id="waiting-heading" className="font-serif text-2xl font-normal tracking-tight text-foreground">Waiting</h2>
        <ul className="space-y-8">
          {waiting.map(prediction => (
            <li key={prediction.id}>
              <div>{prediction.text}</div>
              {prediction.target_date
                ? (
                    <time dateTime={prediction.target_date}>
                      {formatIsoDate(prediction.target_date)}
                    </time>
                  )
                : null}
              <div className="mt-2 flex flex-wrap gap-2">
                <StaffResolveActionButton
                  outcome="invalid"
                  disabled={updateLoading}
                  onClick={() => void resolvePrediction(prediction.id, 'invalid')}
                >
                  Mark invalid
                </StaffResolveActionButton>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
