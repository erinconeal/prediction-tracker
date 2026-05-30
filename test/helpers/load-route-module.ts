import { vi } from 'vitest';

export async function loadRouteModule<T>(
  importer: () => Promise<T>,
): Promise<T> {
  vi.resetModules();
  return importer();
}
