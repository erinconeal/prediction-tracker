# Test utilities

Shared factories build typed fixtures; mocks register Vitest module stubs.

- **`test/factories/`** — `buildPrediction()`, `buildTopic()`, etc. Import and override fields per test.
- **`test/mocks/`** — Side-effect modules that call `vi.mock()`. Import at the top of a test file (or via `vitest.setup.ts` for global mocks like `next/link`).
- **`test/helpers/`** — Plain functions (`loadRouteModule`, `createDeferred`) with no `vi.mock` registration.

Global setup in [`vitest.setup.ts`](../vitest.setup.ts) registers the shared `next/link` mock for all tests.

## Conventions

### Query priority (React Testing Library)

Component tests should resemble how users and assistive technology find UI. ESLint enforces this on `*.{test,spec}.{ts,tsx}` via `eslint-plugin-testing-library` and `test-conventions/no-implementation-assertions`.

**Prefer (in order):**

1. `screen.getByRole('…', { name: /…/ })` — buttons, links, headings, lists, regions, radios, etc.
2. `screen.getByLabelText` — form fields
3. `screen.getByPlaceholderText` — only when no visible label exists
4. `screen.getByText` — static copy users read
5. `screen.getByDisplayValue` — filled-in form values
6. `screen.getByTestId` — last resort when role/label/text cannot target the element

**Avoid in assertions:**

- `toHaveClass()` and `className` checks — assert visibility, ARIA state, or copy instead
- `querySelector()` / `container.querySelector()` — query by role, label, or accessible name
- `parentElement` / decorative DOM traversal — scope with `within()` and query the tree users perceive

**Examples:**

```ts
// Visibility instead of sr-only class names
expect(screen.getByText('Sort by')).not.toBeVisible();

// Region scoped by accessible name (section with aria-labelledby)
const section = screen.getByRole('region', { name: 'Timeline' });
expect(within(section).getByRole('listitem', { current: 'step' })).toBeInTheDocument();

// Behavior instead of CSS “active” classes
expect(screen.getByText(/sorted:/i)).toHaveTextContent('Most accurate source');
```

`testing-library/no-node-access` is **error** — fix node-access warnings when touching a test file.

### When to use what

| Need | Use |
|------|-----|
| A `Prediction`, `Topic`, or leaderboard row with defaults | `test/factories/*` — pass `Partial<…>` overrides only for fields the test cares about |
| Stub `@/services/api` | `import '@/test/mocks/api-service'` then `listPredictions`, `listTopics`, or `listLeaderboard` |
| Stub `next/navigation` | `import '@/test/mocks/next-navigation'` then `mockReplace`, `setMockSearchParams`, `resetNextNavigationMocks` |
| Stub `useTopicCatalog` on forecast cards | `import '@/test/mocks/use-topic-catalog'` (uses real `pickPrimaryTopicFromLinked` + `getTopicsByIds`) |
| Reload an API route module with fresh env/mocks | `loadRouteModule(() => import('./route'))` from `test/helpers/load-route-module` |
| Async timing (resolve after assertion) | `createDeferred()` from `test/helpers/deferred` |
| Idle hook return shapes | `idlePredictionFeed()`, `idleDiscoveryFeedPage()`, `idleLeaderboard()` from `test/factories/hook-results` |

Do **not** add local copies of `samplePrediction`, inline `next/link` mocks, or hand-rolled primary-topic selection in component tests — extend the shared modules instead.

### Mock import order

Side-effect mock modules must run **before** the module under test is loaded. Put the mock import **first** in the file (before React Testing Library and the subject import). ESLint enforces this via `test-conventions/mock-import-first` on `*.{test,spec}.{ts,tsx}`.

Copy-paste scaffold (keep the comment so contributors remember the convention without re-reading this section.):

```ts
// Side-effect mock imports first — see test/README.md#mock-import-order
import '@/test/mocks/api-service';
import { renderHook } from '@testing-library/react';
import { listPredictions } from '@/test/mocks/api-service';
import { usePredictions } from './usePredictions';
```

Same pattern for `@/test/mocks/next-navigation` and `@/test/mocks/use-topic-catalog`.

Global mocks (`next/link`) are registered in `vitest.setup.ts`; individual test files should not redefine them.

### Factories

- Prefer **`buildPrediction(overrides?)`** over inline prediction literals.
- Use **`buildPredictionWithId(id)`** when only `id` varies; **`buildIndexedPrediction(i)`** for numbered rows (dashboard, stats tests).
- Use **`buildTopic(overrides?)`** or helpers like `curatedAiTopic()` / `parentTechTopic()` instead of full `Topic` objects in feed/card tests.
- Use **`buildLeaderboardRow(overrides?)`** for leaderboard DTOs; override `source`, `sourceSlug`, etc. when assertions depend on them.

Keep per-test overrides minimal — defaults live in one place.

### API service mock

- Reset stubs in `beforeEach`: `listPredictions.mockReset()` (and siblings as needed).
- Configure per test: `listPredictions.mockResolvedValue({ items: [buildPrediction()], total: 1 })`.
- The mock spreads the real `@/services/api` module; only the hoisted fns are replaced. **`ApiError` and other exports stay real** — import them from `@/services/api` as usual.

### `useTopicCatalog` mock

- Import `@/test/mocks/use-topic-catalog` once per file; do not reimplement `primaryFromIds` / `parentBucketsFromTopic`.
- Override parent buckets per test: **`setMockGetParentBucketTopics(() => [parentTechTopic])`**.
- Reset overrides in `beforeEach`: **`resetTopicCatalogMockForTests()`**.
- If a test mutates catalog cache state, call **`resetTopicCatalogCacheForTests()`** from `@/hooks/useTopicCatalog` (see `hooks/useTopicCatalog.test.tsx`).

### Navigation mock

- Call **`resetNextNavigationMocks()`** in `beforeEach` when using `mockReplace` or mutating search params.
- Set query state with **`setMockSearchParams(new URLSearchParams('topic=ai'))`** before `render` / `renderHook`.

### Route tests

- Use **`loadRouteModule`** so `vi.resetModules()` runs before each dynamic import; avoids stale module singletons across tests.
- Keep route-specific `vi.mock` blocks (e.g. in-memory stores) in the route test file; only the loader is shared.

### Hoisted mocks (contributors)

Shared mock files use `vi.hoisted()` for mock fns. **Do not `export` the hoisted object directly** — Vitest throws `Cannot export hoisted variable`. Export individual members instead (`export const listPredictions = apiMocks.listPredictions`).

When adding a new shared mock, add a file under `test/mocks/`, document it in this README, and import it from tests that need it (or from `vitest.setup.ts` only if it must apply globally).

### What we are not using (yet)

- **MSW** — MSW is Mock Service Worker — a library that intercepts network requests (fetch, XMLHttpRequest, etc.) at the service-worker layer so tests can return fake HTTP responses without changing application code. Hooks and routes stub modules directly (e.g. @/test/mocks/api-service with vi.mock()), not HTTP; MSW is for future cross-layer HTTP integration tests — real fetch calls, route handlers, hooks — while still controlling responses at the network boundary.
- **`__mocks__` next to `node_modules`** — explicit `test/mocks/*` keeps behavior visible and grep-friendly.
