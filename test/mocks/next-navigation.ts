import { vi } from 'vitest';

const navMocks = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
  searchParams: new URLSearchParams(),
  pathname: '/',
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: navMocks.push,
    replace: navMocks.replace,
  }),
  useSearchParams: () => navMocks.searchParams,
  usePathname: () => navMocks.pathname,
}));

export const mockReplace = navMocks.replace;

export function setMockSearchParams(params: URLSearchParams) {
  navMocks.searchParams = params;
}

export function resetNextNavigationMocks() {
  navMocks.replace.mockReset();
  navMocks.push.mockReset();
  navMocks.searchParams = new URLSearchParams();
  navMocks.pathname = '/';
}
