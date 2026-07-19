import { describe, expect, test } from 'vitest';
import {
  curatedAiTopic,
  curatedHousingTopic,
  parentFinanceTopic,
  parentPoliticsTopic,
  parentTechTopic,
} from '@/test/factories/topic';
import { resolvePredictionTopics } from './resolve-prediction-topics';

describe('resolvePredictionTopics', () => {
  test('given prediction topic ids and a topic catalog, should resolve primary bucket and extras in one pass', () => {
    const catalog = [
      curatedAiTopic,
      curatedHousingTopic,
      parentTechTopic,
      parentPoliticsTopic,
      parentFinanceTopic,
    ];

    const resolved = resolvePredictionTopics(
      [curatedAiTopic.id, curatedHousingTopic.id],
      catalog,
    );

    expect(resolved.primary).toEqual(curatedAiTopic);
    expect(resolved.bucketParent).toEqual(parentTechTopic);
    expect(resolved.extraTopics).toEqual([curatedHousingTopic]);
  });
});
