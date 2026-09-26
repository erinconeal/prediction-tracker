'use client';

import { useRef, type SubmitEvent } from 'react';
import type { Topic } from '@/types/topic';
import { STAFF_ADD_FIELD, type StaffAddFormFieldErrors } from '@/lib/staff-add-form-values';
import { CircleX } from 'lucide-react';
import { Description, Field } from '@headlessui/react';
import { StaffTopicCombobox } from './StaffTopicCombobox';

const staffAddFieldClassName
  = 'w-full min-h-11 rounded-md border border-border bg-background px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const staffAddSubmitClassName
  = 'w-full min-h-11 rounded-md bg-primary px-4 py-2 text-base font-medium text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background';

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="border-error/35 bg-error/10 text-error flex items-center gap-2 pl-2">
      <CircleX className="size-3 shrink-0 stroke-current" aria-hidden strokeWidth={1.75} />
      {message}
    </p>
  );
}

export type StaffAddFormProps = {
  topics: Topic[];
  topicsLoading: boolean;
  topicsError: string | null;
  onRetryTopics: () => void;
  loading: boolean;
  fieldErrors: StaffAddFormFieldErrors;
  submitForm: (formData: FormData, form: HTMLFormElement) => void;
  topicsKey: number;
};

function submitStaffAddForm({
  event,
  staffSecret,
  submitForm,
}: {
  event: SubmitEvent<HTMLFormElement>;
  staffSecret: string;
  submitForm: StaffAddFormProps['submitForm'];
}) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  formData.set(STAFF_ADD_FIELD.staffSecret, staffSecret);
  submitForm(formData, form);
}

export function StaffAddForm({
  topics,
  topicsLoading,
  topicsError,
  onRetryTopics,
  loading,
  fieldErrors,
  submitForm,
  topicsKey,
}: StaffAddFormProps) {
  const staffSecretInputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    submitStaffAddForm({
      event,
      staffSecret: staffSecretInputRef.current?.value ?? '',
      submitForm,
    });
  }

  const topicsDisabled = topicsLoading || Boolean(topicsError);
  const showTopicError = !topicsDisabled && Boolean(fieldErrors.topicIds);

  return (
    <form
      noValidate
      method="post"
      autoComplete="off"
      aria-label="Add a prediction"
      className="max-w-3xl rounded-md bg-surface-elevated border border-border p-6 space-y-6"
      aria-busy={loading}
      onSubmit={handleSubmit}
    >
      <div>
        <label htmlFor="source" className="font-medium text-foreground">Source name</label>
        <input
          type="text"
          id="source"
          className={staffAddFieldClassName}
          name={STAFF_ADD_FIELD.source}
          autoComplete="off"
          aria-invalid={fieldErrors.source ? true : undefined}
          aria-describedby={fieldErrors.source ? 'sourceErrorMessage' : undefined}
          required
        />
        <FieldError id="sourceErrorMessage" message={fieldErrors.source} />
      </div>
      <div>
        <label htmlFor="text" className="font-medium text-foreground">Prediction text</label>
        <textarea
          id="text"
          className={`${staffAddFieldClassName} min-h-48 py-2 resize-y`}
          name={STAFF_ADD_FIELD.text}
          required
          rows={8}
          aria-invalid={fieldErrors.text ? true : undefined}
          aria-describedby={fieldErrors.text ? 'textErrorMessage' : undefined}
        />
        <FieldError id="textErrorMessage" message={fieldErrors.text} />
      </div>
      <div>
        <label htmlFor="dateSaid" className="font-medium text-foreground">Date said</label>
        <input
          type="date"
          id="dateSaid"
          className={`${staffAddFieldClassName} font-mono tabular-nums`}
          name={STAFF_ADD_FIELD.createdAt}
          required
          aria-describedby={fieldErrors.created_at ? 'createdAtErrorMessage dateSaidHelp' : 'dateSaidHelp'}
          aria-invalid={fieldErrors.created_at ? true : undefined}
        />
        <FieldError id="createdAtErrorMessage" message={fieldErrors.created_at} />
        <span id="dateSaidHelp" className="text-muted">The day they said it, not necessarily today.</span>
      </div>
      <div>
        <label htmlFor="deadline" className="font-medium text-foreground">Deadline</label>
        <input type="date" id="deadline" className={`${staffAddFieldClassName} font-mono tabular-nums`} name={STAFF_ADD_FIELD.targetDate} aria-describedby="deadlineHelp" />
        <span id="deadlineHelp" className="text-muted">Optional. When the claim should resolve.</span>
      </div>
      <div>
        <label htmlFor="evidenceUrl" className="font-medium text-foreground">Evidence URL</label>
        <input type="url" id="evidenceUrl" className={staffAddFieldClassName} name={STAFF_ADD_FIELD.evidenceUrl} required aria-invalid={fieldErrors.evidenceUrl ? true : undefined} aria-describedby={fieldErrors.evidenceUrl ? 'evidenceUrlErrorMessage evidenceUrlHelp' : 'evidenceUrlHelp'} />
        <FieldError id="evidenceUrlErrorMessage" message={fieldErrors.evidenceUrl} />
        <span id="evidenceUrlHelp" className="text-muted">Public http(s) link to the original statement.</span>
      </div>
      <Field>
        <StaffTopicCombobox
          key={topicsKey}
          topics={topics}
          disabled={topicsDisabled}
          invalid={showTopicError}
        />
        {topicsError
          ? (
              <div
                className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/35 bg-error/10 px-4 py-3 text-error"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                <span className="flex items-center gap-2">
                  <CircleX className="size-3 shrink-0 stroke-current" aria-hidden strokeWidth={1.75} />
                  <Description as="span">{topicsError}</Description>
                </span>
                <button
                  type="button"
                  id="topicsRetry"
                  className="rounded-lg bg-error min-h-11 px-3 text-base font-medium text-error-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={onRetryTopics}
                >
                  Retry
                </button>
              </div>
            )
          : (
              <Description as="div" className="mt-2 space-y-2">
                {topicsLoading
                  ? <span className="text-muted">Loading topics</span>
                  : (
                      <>
                        <FieldError id="topicIdsErrorMessage" message={fieldErrors.topicIds} />
                        <span className="text-muted">Search and select at least one topic.</span>
                      </>
                    )}
              </Description>
            )}
      </Field>
      <div>
        <label htmlFor="staffSecret" className="font-medium text-foreground">Staff password</label>
        <input
          ref={staffSecretInputRef}
          type="password"
          id="staffSecret"
          className={staffAddFieldClassName}
          required
          autoComplete="new-password"
          aria-invalid={fieldErrors.staffSecret ? true : undefined}
          aria-describedby={fieldErrors.staffSecret ? 'staffSecretErrorMessage staffSecretHelp' : 'staffSecretHelp'}
        />
        <FieldError id="staffSecretErrorMessage" message={fieldErrors.staffSecret} />
        <span id="staffSecretHelp" className="text-muted">Not stored. Compared on the server.</span>
      </div>
      <button type="submit" className={staffAddSubmitClassName} disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
    </form>
  );
}
