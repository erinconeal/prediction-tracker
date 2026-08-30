import { BUCKET_TOPICS } from '@/lib/topic-buckets';
import { getDb } from '@/lib/db';
import { predictions, topicParents, topics } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { insertPrediction } from '@/lib/repositories/prediction-repository';

export const CURATED_TOPIC_SEED = [
  {
    slug: 'midterm-elections-2026',
    name: 'Midterm elections 2026',
    parentSlugs: ['politics'],
  },
  {
    slug: 'world-cup-2026-winner',
    name: 'World Cup 2026 winner',
    parentSlugs: ['sports'],
  },
  {
    slug: 'sp-hits-8000',
    name: 'S&P hits 8000',
    parentSlugs: ['finance'],
  },
  {
    slug: 'ai-regulation-2026',
    name: 'AI regulation 2026',
    parentSlugs: ['tech', 'politics'],
  },
  {
    slug: 'housing-market-2026',
    name: 'Housing market 2026',
    parentSlugs: ['finance'],
  },
  {
    slug: 'ev-adoption-2030',
    name: 'EV adoption 2030',
    parentSlugs: ['tech', 'finance'],
  },
  {
    slug: 'atlantic-hurricane-season-2026',
    name: 'Atlantic hurricane season 2026',
    parentSlugs: ['weather'],
  },
  {
    slug: 'fed-independence-2027',
    name: 'Fed independence 2027',
    parentSlugs: ['finance', 'politics'],
  },
  {
    slug: 'great-depression-analog',
    name: 'Great Depression analog',
    parentSlugs: ['historical', 'finance'],
  },
  {
    slug: 'open-ai-ipo',
    name: 'Open AI IPO',
    parentSlugs: ['tech', 'finance'],
  },
] as const;

export const PREDICTION_SEED = [
  {
    source: 'Jane Analyst',
    text: 'Inflation will stay above 2% through Q4.',
    topicSlugs: ['sp-hits-8000', 'housing-market-2026'],
    target_date: '2026-12-31',
    created_at: '2026-01-05T14:00:00.000Z',
    evidenceUrl: 'https://example.com/jane-analyst/inflation-above-2pct',
  },
  {
    source: 'Tech Blogger',
    text: 'Vendor X ships the new chip before June.',
    topicSlugs: ['ai-regulation-2026'],
    target_date: '2026-06-01',
    created_at: '2026-01-12T16:30:00.000Z',
    evidenceUrl: 'https://example.com/tech-blogger/vendor-x-chip',
  },
  {
    source: 'Jane Analyst',
    text: 'Unemployment dips below 4% this year.',
    topicSlugs: ['housing-market-2026'],
    created_at: '2026-01-20T11:00:00.000Z',
    evidenceUrl: 'https://example.com/jane-analyst/unemployment-below-4pct',
  },
  {
    source: 'Jane Analyst',
    text: 'The Fed cuts rates at least twice before year-end.',
    topicSlugs: ['fed-independence-2027'],
    created_at: '2026-02-03T09:15:00.000Z',
    evidenceUrl: 'https://example.com/jane-analyst/fed-rate-cuts',
  },
  {
    source: 'Political Pundit',
    text: 'Democrats hold the Senate in 2026 midterms.',
    topicSlugs: ['midterm-elections-2026'],
    target_date: '2026-11-01',
    created_at: '2026-02-18T18:00:00.000Z',
    evidenceUrl: 'https://example.com/political-pundit/senate-2026',
  },
  {
    source: 'Sports Analyst',
    text: 'Brazil wins the 2026 World Cup.',
    topicSlugs: ['world-cup-2026-winner'],
    target_date: '2026-07-01',
    created_at: '2026-03-01T12:00:00.000Z',
    evidenceUrl: 'https://example.com/sports-analyst/brazil-world-cup',
  },
  {
    source: 'Climate Writer',
    text: 'At least four Atlantic hurricanes reach Category 3 in 2026.',
    topicSlugs: ['atlantic-hurricane-season-2026'],
    created_at: '2026-03-15T10:00:00.000Z',
    evidenceUrl: 'https://example.com/climate-writer/atlantic-hurricanes-2026',
  },
  {
    source: 'History Buff',
    text: 'A 1930s-style depression begins before 2028.',
    topicSlugs: ['great-depression-analog'],
    created_at: '2026-04-02T13:45:00.000Z',
    evidenceUrl: 'https://example.com/history-buff/1930s-depression',
  },
  {
    source: 'Tech Blogger',
    text: 'Still open: EV share of new US sales exceeds 25% by 2027.',
    topicSlugs: ['ev-adoption-2030'],
    target_date: '2027-06-01',
    created_at: '2026-04-20T15:00:00.000Z',
    evidenceUrl: 'https://example.com/tech-blogger/ev-share-25pct',
  },
  {
    source: 'Jane Analyst',
    text: 'Core CPI cools below 3% before September.',
    topicSlugs: ['sp-hits-8000'],
    created_at: '2026-05-08T08:30:00.000Z',
    evidenceUrl: 'https://example.com/jane-analyst/core-cpi',
  },
  {
    source: 'Jane Analyst',
    text: 'Mortgage rates fall below 6% this year.',
    topicSlugs: ['housing-market-2026'],
    created_at: '2026-05-22T17:00:00.000Z',
    evidenceUrl: 'https://example.com/jane-analyst/mortgage-rates',
  },
  {
    source: 'Jane Analyst',
    text: 'Payrolls growth slows for three straight months.',
    topicSlugs: ['housing-market-2026'],
    created_at: '2026-06-04T12:00:00.000Z',
    evidenceUrl: 'https://example.com/jane-analyst/payrolls-slowdown',
  },
  {
    source: 'Tech Blogger',
    text: 'Major cloud vendor announces on-device AI chips.',
    topicSlugs: ['ai-regulation-2026'],
    created_at: '2026-06-18T19:20:00.000Z',
    evidenceUrl: 'https://example.com/tech-blogger/on-device-ai-chips',
  },
  {
    source: 'Tech Blogger',
    text: 'Open-source model beats proprietary benchmark on coding tasks.',
    topicSlugs: ['ai-regulation-2026'],
    created_at: '2026-07-01T11:00:00.000Z',
    evidenceUrl: 'https://example.com/tech-blogger/oss-coding-benchmark',
  },
  {
    source: 'Political Pundit',
    text: 'Governor race flips in a Sun Belt state.',
    topicSlugs: ['midterm-elections-2026'],
    created_at: '2026-07-15T14:30:00.000Z',
    evidenceUrl: 'https://example.com/political-pundit/sun-belt-governor',
  },
  {
    source: 'Sports Analyst',
    text: 'France reaches the World Cup final.',
    topicSlugs: ['world-cup-2026-winner'],
    created_at: '2026-08-01T09:00:00.000Z',
    evidenceUrl: 'https://example.com/sports-analyst/france-world-cup-final',
  },
  {
    source: 'Climate Writer',
    text: 'Global temperature record broken again in 2026.',
    topicSlugs: ['atlantic-hurricane-season-2026'],
    created_at: '2026-08-12T16:00:00.000Z',
    evidenceUrl: 'https://example.com/climate-writer/temperature-record-2026',
  },
] as const;

// Outcome overrides by index in PREDICTION_SEED (matches applySeedOutcome logic)
export const PREDICTION_OUTCOME_OVERRIDES = [
  { index: 0, outcome: 'incorrect', hoursAgo: 50 },
  { index: 2, outcome: 'correct', hoursAgo: 40 },
  { index: 9, outcome: 'correct', hoursAgo: 12 },
  { index: 10, outcome: 'correct', hoursAgo: 8 },
  { index: 11, outcome: 'correct', hoursAgo: 4 },
  { index: 3, outcome: 'unresolved', hoursAgo: 35 },
  { index: 1, outcome: 'incorrect', hoursAgo: 45 },
  { index: 12, outcome: 'correct', hoursAgo: 20 },
  { index: 13, outcome: 'correct', hoursAgo: 15 },
  { index: 4, outcome: 'correct', hoursAgo: 30 },
  { index: 14, outcome: 'incorrect', hoursAgo: 25 },
  { index: 5, outcome: 'correct', hoursAgo: 28 },
  { index: 15, outcome: 'incorrect', hoursAgo: 22 },
  { index: 6, outcome: 'correct', hoursAgo: 26 },
  { index: 16, outcome: 'incorrect', hoursAgo: 18 },
  { index: 7, outcome: 'incorrect', hoursAgo: 32 },
] as const;

function topicId(slug: string): string {
  return `topic-${slug}`;
}

async function seedTopics(db = getDb()): Promise<void> {
// Buckets
  await db.insert(topics).values(
    BUCKET_TOPICS.map(b => ({
      id: topicId(b.slug),
      slug: b.slug,
      name: b.name,
      kind: 'bucket' as const,
    })),
  ).onConflictDoNothing();

  // Curated + parents (multiple parents = multiple topic_parents rows)
  for (const row of CURATED_TOPIC_SEED) {
    await db.insert(topics).values({
      id: topicId(row.slug),
      slug: row.slug,
      name: row.name,
      kind: 'curated',
    }).onConflictDoNothing();

    for (const parentSlug of row.parentSlugs) {
      await db.insert(topicParents).values({
        topicId: topicId(row.slug),
        parentTopicId: topicId(parentSlug),
      }).onConflictDoNothing();
    }
  }
}

async function tid(slug: string, db = getDb()): Promise<string> {
  const id = topicId(slug);
  const row = await db.query.topics.findFirst({ where: eq(topics.id, id) });
  if (!row) throw new Error(`seed topic missing: ${slug}`);
  return id;
}

async function seedPredictions(db = getDb()) {
  const now = new Date();
  const insertedIds: string[] = [];

  for (const sample of PREDICTION_SEED) {
    const topicIds = await Promise.all(sample.topicSlugs.map(slug => tid(slug, db)));

    const row = await insertPrediction({
      created_at: sample.created_at,
      source: sample.source,
      text: sample.text,
      topicIds,
      target_date: 'target_date' in sample ? sample.target_date : undefined,
      evidenceUrl: sample.evidenceUrl,
    });
    insertedIds.push(row.id);
  }

  for (const { index, outcome, hoursAgo } of PREDICTION_OUTCOME_OVERRIDES) {
    const id = insertedIds[index];
    const finishedAt = new Date(now.getTime() - hoursAgo * 3600000).toISOString();
    await db.update(predictions)
      .set({ outcome, finishedAt })
      .where(eq(predictions.id, id));
  }
};

export async function runSeed({ force = false } = {}) {
  const db = getDb();
  const existing = await db.select().from(topics).limit(1);

  if (!force && existing.length > 0) {
    console.log('Database already seeded; skipping. Use --force to re-seed.');
    return;
  }

  if (force) {
    // Optional: delete in FK-safe order, or delete the sqlite file and re-migrate
    console.log('Deleting existing data...');
    await db.delete(topicParents).execute();
    await db.delete(predictions).execute();
    await db.delete(topics).execute();
  }

  await seedTopics(db);
  await seedPredictions(db);
  console.log('Database seeded successfully.');
};
