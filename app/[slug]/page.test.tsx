import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const notFound = vi.fn(() => {
  throw new Error('NOT_FOUND');
});

vi.mock('next/navigation', () => ({
  notFound,
}));

vi.mock('@/components/feed/TopicFeedView', () => ({
  TopicFeedView: ({ topic }: { topic: { slug: string; name: string } }) => (
    <div data-testid="topic-feed">{topic.slug}</div>
  ),
}));

async function loadPage() {
  vi.resetModules();
  return import('./page');
}

describe('TopicPage', () => {
  beforeEach(() => {
    notFound.mockClear();
  });

  test('given reserved slug, should notFound', async () => {
    const { default: TopicPage } = await loadPage();

    await expect(
      TopicPage({ params: Promise.resolve({ slug: 'about' }) }),
    ).rejects.toThrow('NOT_FOUND');
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  test('given unknown slug, should notFound', async () => {
    const { default: TopicPage } = await loadPage();

    await expect(
      TopicPage({ params: Promise.resolve({ slug: 'not-a-real-topic' }) }),
    ).rejects.toThrow('NOT_FOUND');
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  test('given known topic slug, should render topic feed', async () => {
    const { default: TopicPage } = await loadPage();
    const view = await TopicPage({
      params: Promise.resolve({ slug: 'finance' }),
    });

    render(view);
    expect(notFound).not.toHaveBeenCalled();
    expect(screen.getByTestId('topic-feed')).toHaveTextContent('finance');
  });
});

describe('generateMetadata', () => {
  test('given reserved slug, should return not-found title', async () => {
    const { generateMetadata } = await loadPage();
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'about' }),
    });

    expect(meta).toEqual({ title: 'Topic not found' });
  });

  test('given known topic slug, should return topic title', async () => {
    const { generateMetadata } = await loadPage();
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'finance' }),
    });

    expect(meta.title).toBe('Finance');
    expect(meta.description).toContain('Finance');
  });
});
