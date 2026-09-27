import { normalizeTargetDate } from './mappers/prediction-mapper';

export const isDeadlineDateAfterDateSaid = (deadlineDate: string, dateSaid: string) => {
  const deadlineDateNormalized = normalizeTargetDate(deadlineDate);
  const dateSaidNormalized = normalizeTargetDate(dateSaid);

  return deadlineDateNormalized > dateSaidNormalized;
};
