'use client';

import { FieldError } from './FieldError';
import { staffFieldClassName } from './staff-field-class';

export function StaffPassword({ ref, fieldErrors }: { ref: React.RefObject<HTMLInputElement | null>; fieldErrors: { staffSecret?: string } }) {
  return (
    <>
      <label htmlFor="staffSecret" className="font-medium text-foreground">Staff password (required)</label>
      <input
        ref={ref}
        type="password"
        id="staffSecret"
        className={`${staffFieldClassName} mb-0`}
        required
        autoComplete="new-password"
        aria-invalid={fieldErrors.staffSecret ? true : undefined}
        aria-describedby={fieldErrors.staffSecret ? 'staffSecretErrorMessage staffSecretHelp' : 'staffSecretHelp'}
      />
      <FieldError id="staffSecretErrorMessage" message={fieldErrors.staffSecret} className="mb-0" />
      <span id="staffSecretHelp" className="text-muted">Not stored. Compared on the server.</span>
    </>
  );
}
