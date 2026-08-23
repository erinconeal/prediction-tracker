import { describe, expect, test } from 'vitest';
import { assertStaffSecret } from './assert-staff-secret';

describe('assertStaffSecret', () => {
  test('given missing header, should return 401', () => {
    const request = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const response = assertStaffSecret(request);
    expect(response?.status).toBe(401);
  });

  test('given wrong header, should return 401', () => {
    const request = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-staff-secret': 'wrong-secret',
      },
    });
    const response = assertStaffSecret(request);
    expect(response?.status).toBe(401);
  });

  test('given unset env and a header that would match, should return 401', () => {
    const previousSecret = process.env.STAFF_SECRET;
    try {
      delete process.env.STAFF_SECRET;
      const request = new Request('http://localhost/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-secret': previousSecret ?? 'test-staff-secret',
        },
      });
      const response = assertStaffSecret(request);
      expect(response?.status).toBe(401);
    }
    finally {
      if (previousSecret === undefined) {
        delete process.env.STAFF_SECRET;
      }
      else {
        process.env.STAFF_SECRET = previousSecret;
      }
    }
  });

  test('given set env, should return null', () => {
    process.env.STAFF_SECRET = 'test-staff-secret';
    const request = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-staff-secret': 'test-staff-secret',
      },
    });
    const response = assertStaffSecret(request);
    expect(response).toBeNull();
  });
});
