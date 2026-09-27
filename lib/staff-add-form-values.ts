import { normalizeTargetDate } from '@/lib/mappers/prediction-mapper';
import type { CreatePredictionInput } from '@/types/prediction';
import { readString, readStringList, isHttpOrHttpsUrl } from '@/utils/form-helpers';
import { isDeadlineDateAfterDateSaid } from './prediction-dates';

export const STAFF_ADD_FIELD = {
  source: 'source',
  text: 'text',
  createdAt: 'created_at',
  targetDate: 'target_date',
  evidenceUrl: 'evidenceUrl',
  topicIds: 'topicIds',
  staffSecret: 'staffSecret',
} as const;

export type StaffAddFormField
  = (typeof STAFF_ADD_FIELD)[keyof typeof STAFF_ADD_FIELD];

export type StaffAddFormFieldErrors = Partial<
  Record<StaffAddFormField, string>
>;

export type StaffAddFormValuesResult
  = | { ok: true; input: CreatePredictionInput; staffSecret: string }
    | { ok: false; errors: StaffAddFormFieldErrors };

/** Form control ids in visual order for the first invalid staff-add field. */
export const STAFF_ADD_ERROR_FOCUS_IDS = [
  { field: STAFF_ADD_FIELD.source, id: 'source' },
  { field: STAFF_ADD_FIELD.text, id: 'text' },
  { field: STAFF_ADD_FIELD.createdAt, id: 'dateSaid' },
  { field: STAFF_ADD_FIELD.evidenceUrl, id: 'evidenceUrl' },
  { field: STAFF_ADD_FIELD.topicIds, id: 'topicIds' },
  { field: STAFF_ADD_FIELD.staffSecret, id: 'staffSecret' },
] as const;

/**
 * Returns the first invalid staff-add control id in form order.
 */
export function firstStaffAddErrorFocusId(
  errors: StaffAddFormFieldErrors,
): string | undefined {
  return STAFF_ADD_ERROR_FOCUS_IDS.find(({ field }) => Boolean(errors[field]))?.id;
}

/**
 * Moves focus to the first invalid staff-add control under `root`.
 */
export function focusFirstStaffAddError(
  root: ParentNode,
  errors: StaffAddFormFieldErrors,
): void {
  const id = firstStaffAddErrorFocusId(errors);
  if (!id) return;
  const node = root.querySelector(`#${id}`);
  if (node instanceof HTMLElement) node.focus();
}

/**
 * True when `value` is an ISO datetime or YYYY-MM-DD the API will accept.
 */
function isIsoOrCalendarDate(value: string): boolean {
  try {
    normalizeTargetDate(value);
    return true;
  }
  catch {
    return false;
  }
}

/**
 * Reads a staff add form into create input plus the secret header value.
 * Does not POST. Empty deadline is omitted. A deadline that is present must be
 * a real date after the date said. At least one topic is required.
 * Date said must be a real ISO or YYYY-MM-DD date.
 */
export function parseStaffAddFormValues(formData: FormData): StaffAddFormValuesResult {
  const fields: StaffAddFormFieldErrors = {};

  const source = readString(formData, STAFF_ADD_FIELD.source).trim();
  const text = readString(formData, STAFF_ADD_FIELD.text).trim();
  const createdAt = readString(formData, STAFF_ADD_FIELD.createdAt).trim();
  const evidenceUrl = readString(formData, STAFF_ADD_FIELD.evidenceUrl).trim();
  const targetDate = readString(formData, STAFF_ADD_FIELD.targetDate).trim();
  const topicIds = readStringList(formData, STAFF_ADD_FIELD.topicIds);
  const staffSecret = readString(formData, STAFF_ADD_FIELD.staffSecret).trim();

  const dateSaidIsValid = createdAt !== '' && isIsoOrCalendarDate(createdAt);
  if (!source) fields.source = 'Source name is required';
  if (!text) fields.text = 'Prediction text is required';
  if (!createdAt) {
    fields.created_at = 'Date said is required';
  }
  else if (!dateSaidIsValid) {
    fields.created_at = 'Date said must be a valid date in YYYY-MM-DD format';
  }
  if (targetDate && !isIsoOrCalendarDate(targetDate)) {
    fields.target_date = 'Deadline must be a valid date in YYYY-MM-DD format';
  }
  else if (
    targetDate
    && dateSaidIsValid
    && !isDeadlineDateAfterDateSaid(targetDate, createdAt)
  ) {
    fields.target_date = 'Deadline date must be after date said';
  }
  if (!isHttpOrHttpsUrl(evidenceUrl)) {
    fields.evidenceUrl = 'Evidence URL must be an http or https link';
  }
  if (topicIds.length === 0) {
    fields.topicIds = 'Select at least one topic';
  }
  if (!staffSecret) fields.staffSecret = 'Staff password is required';
  if (Object.keys(fields).length > 0) {
    return { ok: false, errors: fields };
  }

  return {
    ok: true,
    staffSecret,
    input: {
      source,
      text,
      topicIds,
      created_at: createdAt,
      evidenceUrl,
      ...(targetDate ? { target_date: targetDate } : {}),
    },
  };
};
