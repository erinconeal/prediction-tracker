export const jsonStaffHeaders = {
  'Content-Type': 'application/json',
  'x-staff-secret': process.env.STAFF_SECRET!,
} as const;
