import type { Prediction } from '@/types/prediction';

export function buildPrediction(overrides: Partial<Prediction> = {}): Prediction {
  return {
    id: 'p-1',
    source: 'Alice',
    sourceSlug: 'alice',
    text: 'It will rain',
    topicIds: [],
    created_at: '2024-01-01T00:00:00.000Z',
    finished_at: null,
    target_date: null,
    outcome: 'still_open',
    ...overrides,
  };
}

export function buildPredictionWithId(
  id: string,
  overrides: Partial<Prediction> = {},
): Prediction {
  return buildPrediction({
    id,
    text: `Prediction ${id}`,
    ...overrides,
  });
}

export function buildIndexedPrediction(
  i: number,
  overrides: Partial<Prediction> = {},
): Prediction {
  return buildPrediction({
    id: `id-${i}`,
    source: 'Source',
    sourceSlug: 'source',
    text: `Prediction ${i}`,
    ...overrides,
  });
}
