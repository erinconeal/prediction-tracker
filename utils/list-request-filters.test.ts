import { describe, expect, test } from 'vitest';
import { toListRequestFilters } from './list-request-filters';

describe('toListRequestFilters', () => {
  test('given empty filters, should omit sort', () => {
    expect(toListRequestFilters({})).toEqual({});
  });

  test('given sort newest or omitted, should omit sort from request filters', () => {
    expect(toListRequestFilters({ sort: 'newest' })).toEqual({});
    expect(toListRequestFilters({ status: 'all', sort: 'newest', topic: 'tech' })).toEqual({
      status: 'all',
      topic: 'tech',
    });
  });

  test('given non-default sort, should keep sort in request filters', () => {
    expect(toListRequestFilters({ sort: 'recently_finished', topic: 'politics' })).toEqual({
      sort: 'recently_finished',
      topic: 'politics',
    });
  });
});
