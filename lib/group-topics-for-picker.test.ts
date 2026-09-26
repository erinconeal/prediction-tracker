import { describe, expect, test } from 'vitest';
import {
  curatedAiTopic,
  curatedHousingTopic,
  curatedMidtermTopic,
  parentFinanceTopic,
  parentPoliticsTopic,
  parentTechTopic,
} from '@/test/factories/topic';
import { groupTopicsForPicker } from '@/lib/group-topics-for-picker';

const catalog = [
  curatedMidtermTopic,
  parentTechTopic,
  curatedAiTopic,
  parentPoliticsTopic,
  curatedHousingTopic,
  parentFinanceTopic,
];

describe('groupTopicsForPicker', () => {
  test('given a catalog, should list each child under every parent, parents first and alphabetical', () => {
    expect(groupTopicsForPicker(catalog, '')).toEqual([
      { parent: parentFinanceTopic, children: [curatedHousingTopic] },
      { parent: parentPoliticsTopic, children: [curatedAiTopic, curatedMidtermTopic] },
      { parent: parentTechTopic, children: [curatedAiTopic] },
    ]);
  });

  test('given a child name, should keep that child under its parent and omit other groups', () => {
    expect(groupTopicsForPicker(catalog, 'midterm')).toEqual([
      { parent: parentPoliticsTopic, children: [curatedMidtermTopic] },
    ]);
  });

  test('given a parent name, should keep that parent and every child under it', () => {
    expect(groupTopicsForPicker(catalog, 'politics')).toEqual([
      { parent: parentPoliticsTopic, children: [curatedAiTopic, curatedMidtermTopic] },
    ]);
  });

  test('given a curated topic whose parents are not in the catalog, should list it without a parent', () => {
    expect(groupTopicsForPicker([curatedAiTopic], '')).toEqual([
      { parent: null, children: [curatedAiTopic] },
    ]);
  });

  test('given a query that matches nothing, should return no groups', () => {
    expect(groupTopicsForPicker(catalog, 'not-a-topic')).toEqual([]);
  });
});
