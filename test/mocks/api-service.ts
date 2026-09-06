import { vi } from 'vitest';

const apiMocks = vi.hoisted(() => ({
  listPredictions: vi.fn(),
  listTopics: vi.fn(),
  listLeaderboard: vi.fn(),
  getTopic: vi.fn(),
  createPrediction: vi.fn(),
}));

vi.mock('@/services/api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/services/api')>();
  return {
    ...mod,
    listPredictions: apiMocks.listPredictions,
    listTopics: apiMocks.listTopics,
    listLeaderboard: apiMocks.listLeaderboard,
    getTopic: apiMocks.getTopic,
    createPrediction: apiMocks.createPrediction,
  };
});

export const listPredictions = apiMocks.listPredictions;
export const listTopics = apiMocks.listTopics;
export const listLeaderboard = apiMocks.listLeaderboard;
export const getTopic = apiMocks.getTopic;
export const createPrediction = apiMocks.createPrediction;
