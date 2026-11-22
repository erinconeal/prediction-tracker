'use client';
import { CircleX, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { usePredictions } from '@/hooks/usePredictions';
import { useUpdatePrediction } from '@/hooks/useUpdatePrediction';

import { LoadingRegion } from '../ui/LoadingRegion';
import { Skeleton } from '../ui/Skeleton';
import { StaffResolveForm } from './StaffResolveForm';

export function StaffResolveView() {
  const [successId, setSuccessId] = useState<string | null>(null);
  const successStatusRef = useRef<HTMLDivElement>(null);
  const { data: rows, loading, error, refetch } = usePredictions({ status: 'still_open', limit: 100 });
  const { update, loading: updateLoading, error: updateError } = useUpdatePrediction();

  useEffect(() => {
    if (!successId) return;
    successStatusRef.current?.focus();
  }, [successId]);

  return (
    <div>
      <p
        role="alert"
        className={
          error
            ? 'mb-6 flex items-center gap-2 rounded-lg border border-error/35 bg-error/10 p-4 text-error'
            : 'sr-only'
        }
      >
        {error
          ? (
              <>
                <CircleX className="size-3 shrink-0 stroke-current" aria-hidden strokeWidth={1.75} />
                {error}
              </>
            )
          : null}
      </p>
      {error
        ? (
            <button
              type="button"
              className="mb-6 inline-flex min-h-11 items-center rounded-lg bg-error px-3 text-base font-medium text-error-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={() => void refetch()}
            >
              Retry
            </button>
          )
        : null}
      <p
        role="alert"
        className={updateError ? 'mb-6 flex items-center gap-2 rounded-lg border border-error/35 bg-error/10 p-4 text-error' : 'sr-only'}
      >
        {updateError
          ? (
              <>
                <CircleX className="size-3 shrink-0 stroke-current" aria-hidden strokeWidth={1.75} />
                {updateError}
              </>
            )
          : null}
      </p>
      {successId
        ? (
            <>
              <div role="status" className="text-success" ref={successStatusRef} tabIndex={successId ? -1 : undefined}>Prediction resolved</div>
              <button
                type="button"
                aria-label="Dismiss success message"
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-success hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2"
                onClick={() => {
                  document.getElementById('staffSecret')?.focus();
                  setSuccessId(null);
                }}
              >
                <X className="size-4" aria-hidden strokeWidth={1.75} />
              </button>
            </>
          )
        : null}
      {loading && rows.length === 0
        ? (
            <LoadingRegion label="Loading predictions">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </LoadingRegion>
          )
        : rows.length > 0
          ? (
              <StaffResolveForm
                onResolved={setSuccessId}
                update={update}
                refetch={refetch}
                updateLoading={updateLoading}
                rows={rows}
              />
            )
          : !error
              ? <div role="status" className="text-muted">Nothing to resolve</div>
              : null}
    </div>
  );
}
