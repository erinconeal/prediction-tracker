import 'server-only';
import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';

/**
 * @param request
 * If env is missing or empty → 401. Fail closed. Do not fall back to a default.
 * If the header is missing/wrong → 401. Same status for both so you do not leak “unset vs wrong”.
 * On success, return null (or otherwise signal “continue”). Let the route keep doing JSON validation.
 */
export function assertStaffSecret(request: Request): NextResponse | null {
  const staffSecret = process.env.STAFF_SECRET;
  if (!staffSecret) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const hashedStaffSecret = createHash('sha3-256').update(staffSecret, 'utf8').digest('hex');
  const headerSecret = request.headers.get('x-staff-secret');
  const hashedHeaderSecret = headerSecret ? createHash('sha3-256').update(headerSecret, 'utf8').digest('hex') : '';
  if (hashedStaffSecret !== hashedHeaderSecret) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
