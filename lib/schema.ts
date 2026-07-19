import { relations } from 'drizzle-orm';
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { OUTCOMES } from '@/types/prediction';
import { TOPIC_KINDS } from '@/types/topic';

// --- topics ---

export const topics = sqliteTable('topics', {
  id: text('id').primaryKey(), // e.g. 'topic-politics'
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  kind: text('kind', { enum: TOPIC_KINDS }).notNull(),
});

// curated topic --> bucket topic (many-to-many)
// topic-ai --> topic-tech
// topic-ai --> topic-politics
export const topicParents = sqliteTable('topic_parents', {
  topicId: text('topic_id')
    .notNull()
    .references(() => topics.id, { onDelete: 'cascade' }),
  parentTopicId: text('parent_topic_id')
    .notNull()
    .references(() => topics.id, { onDelete: 'cascade' }),
}, table => [
  primaryKey({ columns: [table.topicId, table.parentTopicId] }),
  index('topic_parents_parent_idx').on(table.parentTopicId),
]);

// --- sources (allowlist) ---

export const sources = sqliteTable('sources', {
  id: text('id').primaryKey(), // stable id, e.g. "source-john-smith"
  slug: text('slug').notNull().unique(), // URL segment
  displayName: text('display_name').notNull(),
  profileUrl: text('profile_url'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
});

// --- predictions ---

export const predictions = sqliteTable('predictions', {
  id: text('id').primaryKey(), // UUID string
  sourceId: text('source_id')
    .notNull()
    .references(() => sources.id),
  text: text('text').notNull(),
  createdAt: text('created_at').notNull(), // ISO datetime string
  finishedAt: text('finished_at'), // null while still open
  targetDate: text('target_date'), // ISO string or null
  outcome: text('outcome', {
    enum: OUTCOMES,
  }).notNull().default('still_open'),
  evidenceUrl: text('evidence_url'),
}, table => [
  index('predictions_source_idx').on(table.sourceId),
  index('predictions_outcome_idx').on(table.outcome),
  index('predictions_created_at_idx').on(table.createdAt),
]);

// prediction <--> topic (many-to-many)
export const predictionTopics = sqliteTable('prediction_topics', {
  predictionId: text('prediction_id')
    .notNull()
    .references(() => predictions.id, { onDelete: 'cascade' }),
  topicId: text('topic_id')
    .notNull()
    .references(() => topics.id, { onDelete: 'cascade' }),
}, table => [
  primaryKey({ columns: [table.predictionId, table.topicId] }),
  index('prediction_topics_topic_idx').on(table.topicId),
]);

// --- relations for joined queries ---

export const topicRelations = relations(topics, ({ many }) => ({
  // Rows where this topic is the parent (bucket) --> use with { topic: true } for children
  parentLinks: many(topicParents, { relationName: 'topicAsParent' }),
  // Rows where this topic is the child (curated) --> use with { parent: true } for parents
  childLinks: many(topicParents, { relationName: 'topicAsChild' }),
  predictionLinks: many(predictionTopics),
}));

export const topicParentsRelations = relations(topicParents, ({ one }) => ({
  topic: one(topics, {
    fields: [topicParents.topicId],
    references: [topics.id],
    relationName: 'topicAsChild',
  }),
  parent: one(topics, {
    fields: [topicParents.parentTopicId],
    references: [topics.id],
    relationName: 'topicAsParent',
  }),
}));

export const sourcesRelations = relations(sources, ({ many }) => ({
  predictions: many(predictions),
}));

export const predictionsRelations = relations(predictions, ({ one, many }) => ({
  source: one(sources, {
    fields: [predictions.sourceId],
    references: [sources.id],
  }),
  topicLinks: many(predictionTopics),
}));

export const predictionTopicsRelations = relations(predictionTopics, ({ one }) => ({
  prediction: one(predictions, {
    fields: [predictionTopics.predictionId],
    references: [predictions.id],
  }),
  topic: one(topics, {
    fields: [predictionTopics.topicId],
    references: [topics.id],
  }),
}));
