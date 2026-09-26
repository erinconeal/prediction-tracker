'use client';

import { StaffAddForm } from './StaffAddForm';
import { useCreatePrediction } from '@/hooks/useCreatePrediction';
import { useTopicCatalog } from '@/hooks/useTopicCatalog';
import {
  firstStaffAddErrorFocusId,
  focusFirstStaffAddError,
  parseStaffAddFormValues,
  STAFF_ADD_FIELD,
  type StaffAddFormFieldErrors,
} from '@/lib/staff-add-form-values';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export function StaffAddView() {
  const [fieldErrors, setFieldErrors] = useState<StaffAddFormFieldErrors>({});
  const [topicsKey, setTopicsKey] = useState(0);
  const [successId, setSuccessId] = useState<string | null>(null);
  const pendingErrorFocusRef = useRef(false);
  const successStatusRef = useRef<HTMLParagraphElement>(null);
  const { topics, loading: topicsLoading, error: topicsError, refetch: refetchTopics } = useTopicCatalog();
  const { create, loading, error } = useCreatePrediction();

  useEffect(() => {
    if (!pendingErrorFocusRef.current) return;
    pendingErrorFocusRef.current = false;
    if (topicsError && firstStaffAddErrorFocusId(fieldErrors) === 'topicIds') {
      const retry = document.getElementById('topicsRetry');
      if (retry instanceof HTMLElement) {
        retry.focus();
        return;
      }
    }
    focusFirstStaffAddError(document, fieldErrors);
  }, [fieldErrors, topicsError]);

  useEffect(() => {
    if (!successId) return;
    successStatusRef.current?.focus();
  }, [successId]);

  const handleSubmit = async (formData: FormData, form: HTMLFormElement) => {
    setSuccessId(null);
    const result = parseStaffAddFormValues(formData);
    if (!result.ok) {
      pendingErrorFocusRef.current = true;
      setFieldErrors(result.errors);
      return;
    }
    setFieldErrors({});
    const created = await create(result.input, { staffSecret: result.staffSecret });
    if (!created) return;

    for (const name of [
      STAFF_ADD_FIELD.text,
      STAFF_ADD_FIELD.createdAt,
      STAFF_ADD_FIELD.targetDate,
      STAFF_ADD_FIELD.evidenceUrl,
    ] as const) {
      const el = form.elements.namedItem(name);
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.value = '';
    }

    setTopicsKey(key => key + 1);
    setSuccessId(created.id);
  };

  return (
    <div>
      <div className={successId ? 'mb-6 flex items-start gap-3 rounded-lg border border-success/35 bg-surface-elevated p-4 text-success' : undefined}>
        <div className={successId ? 'min-w-0 flex-1' : undefined}>
          <p
            ref={successStatusRef}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            tabIndex={successId ? -1 : undefined}
            className={successId ? 'inline rounded-sm focus:outline-none focus:ring-2 focus:ring-interactive focus:ring-offset-2' : 'sr-only'}
          >
            {successId ? 'New prediction created successfully!' : null}
          </p>
          {successId
            ? (
                <>
                  {' '}
                  <Link href={`/predictions/${successId}`} className="font-medium underline underline-offset-2 text-interactive">
                    View prediction
                  </Link>
                </>
              )
            : null}
        </div>
        {successId
          ? (
              <button
                type="button"
                aria-label="Dismiss success message"
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-success hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2"
                onClick={() => {
                  document.getElementById('source')?.focus();
                  setSuccessId(null);
                }}
              >
                <X className="size-4" aria-hidden strokeWidth={1.75} />
              </button>
            )
          : null}
      </div>
      <p
        role="alert"
        className={error ? 'mb-6 rounded-lg border border-error/35 bg-error/10 p-4 text-error' : 'sr-only'}
      >
        {error}
      </p>
      <StaffAddForm
        topics={topics}
        topicsLoading={topicsLoading}
        topicsError={topicsError}
        onRetryTopics={refetchTopics}
        loading={loading}
        fieldErrors={fieldErrors}
        submitForm={handleSubmit}
        topicsKey={topicsKey}
      />
    </div>
  );
}
