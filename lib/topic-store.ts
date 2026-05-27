import type { Prediction } from '@/types/prediction';
import type { Topic, TopicKind } from '@/types/topic';
import { BUCKET_TOPICS } from '@/lib/topic-buckets';
import { pickPrimaryTopicFromLinked } from '@/lib/topic-primary';
import { slugify } from '@/utils/slugify';

const topics: Topic[] = [];

function topicId(slug: string): string {
  return `topic-${slug}`;
}

function seedTopics(): void {
  if (topics.length > 0) return;

  const buckets: Omit<Topic, 'id'>[] = BUCKET_TOPICS.map(b => ({
    slug: b.slug,
    name: b.name,
    kind: 'bucket',
    parentTopicIds: [],
  }));

  for (const row of buckets) {
    topics.push({ id: topicId(row.slug), ...row });
  }

  const b = (slug: string) => topicId(slug);

  const curated: Omit<Topic, 'id'>[] = [
    {
      slug: 'midterm-elections-2026',
      name: 'Midterm elections 2026',
      kind: 'curated',
      parentTopicIds: [b('politics')],
    },
    {
      slug: 'world-cup-2026-winner',
      name: 'World Cup 2026 winner',
      kind: 'curated',
      parentTopicIds: [b('sports')],
    },
    {
      slug: 'sp-hits-8000',
      name: 'S&P hits 8000',
      kind: 'curated',
      parentTopicIds: [b('finance')],
    },
    {
      slug: 'ai-regulation-2026',
      name: 'AI regulation 2026',
      kind: 'curated',
      parentTopicIds: [b('tech'), b('politics')],
    },
    {
      slug: 'housing-market-2026',
      name: 'Housing market 2026',
      kind: 'curated',
      parentTopicIds: [b('finance')],
    },
    {
      slug: 'ev-adoption-2030',
      name: 'EV adoption 2030',
      kind: 'curated',
      parentTopicIds: [b('tech'), b('finance')],
    },
    {
      slug: 'atlantic-hurricane-season-2026',
      name: 'Atlantic hurricane season 2026',
      kind: 'curated',
      parentTopicIds: [b('weather')],
    },
    {
      slug: 'fed-independence-2027',
      name: 'Fed independence 2027',
      kind: 'curated',
      parentTopicIds: [b('finance'), b('politics')],
    },
    {
      slug: 'great-depression-analog',
      name: 'Great Depression analog',
      kind: 'curated',
      parentTopicIds: [b('historical'), b('finance')],
    },
    {
      slug: 'open-ai-ipo',
      name: 'Open AI IPO',
      kind: 'curated',
      parentTopicIds: [b('tech'), b('finance')],
    },
  ];

  for (const row of curated) {
    topics.push({ id: topicId(row.slug), ...row });
  }
}

export function listTopics(): Topic[] {
  seedTopics();
  return [...topics];
}

export function listBucketTopics(): Topic[] {
  seedTopics();
  return topics.filter(t => t.kind === 'bucket');
}

export function listCuratedTopics(): Topic[] {
  seedTopics();
  return topics.filter(t => t.kind === 'curated');
}

export function getTopicBySlug(slug: string): Topic | null {
  seedTopics();
  const norm = slug.trim().toLowerCase();
  return topics.find(t => t.slug === norm) ?? null;
}

export function getTopicById(id: string): Topic | null {
  seedTopics();
  return topics.find(t => t.id === id) ?? null;
}

export function getTopicsByIds(ids: string[]): Topic[] {
  seedTopics();
  const set = new Set(ids);
  return topics.filter(t => set.has(t.id));
}

export function listTopicsForBucket(bucketSlug: string): Topic[] {
  seedTopics();
  const bucket = getTopicBySlug(bucketSlug);
  if (!bucket || bucket.kind !== 'bucket') return [];
  return topics.filter(
    t => t.kind === 'curated' && t.parentTopicIds.includes(bucket.id),
  );
}

/** Resolve topic IDs to topics; unknown IDs are skipped. */
export function resolveTopicIds(ids: string[]): Topic[] {
  return getTopicsByIds(ids);
}

/** Prefer curated linked topic for display; else first bucket topic. */
export function primaryTopicForPrediction(p: Prediction): Topic | null {
  const linked = getTopicsByIds(p.topicIds);
  return pickPrimaryTopicFromLinked(linked);
}

/** Primary bucket topic for diversity / browse grouping. */
export function primaryBucketTopicForPrediction(p: Prediction): Topic | null {
  const linked = getTopicsByIds(p.topicIds);
  for (const t of linked) {
    if (t.kind === 'bucket') return t;
  }
  for (const t of linked) {
    if (t.kind === 'curated' && t.parentTopicIds.length > 0) {
      const parent = getTopicById(t.parentTopicIds[0]!);
      if (parent?.kind === 'bucket') return parent;
    }
  }
  return null;
}

export function ensureTopicSlug(name: string): string {
  return slugify(name);
}

export function isTopicKind(value: string): value is TopicKind {
  return value === 'bucket' || value === 'curated';
}
