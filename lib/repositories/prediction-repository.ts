import { eq, inArray } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { normalizeTargetDate, toPrediction, toPredictionInsert } from '@/lib/mappers/prediction-mapper';
import { findOrCreateSource } from '@/lib/repositories/source-repository';
import { predictionTopics, predictions, sources } from '@/lib/schema';
import type { CreatePredictionInput, Prediction, TerminalOutcome } from '@/types/prediction';

export async function loadPredictionById(id: string): Promise<Prediction | null> {
  const row = await getDb()
    .select({ prediction: predictions, source: sources })
    .from(predictions)
    .innerJoin(sources, eq(predictions.sourceId, sources.id))
    .where(eq(predictions.id, id))
    .limit(1);

  const hit = row[0];
  if (!hit) return null;

  const topicIds = await loadTopicIdsForPrediction(id);

  return toPrediction(hit.prediction, hit.source, topicIds);
};

async function loadTopicIdsForPrediction(predictionId: string): Promise<string[]> {
  const links = await getDb()
    .select({ topicId: predictionTopics.topicId })
    .from(predictionTopics)
    .where(eq(predictionTopics.predictionId, predictionId));
  return links.map(l => l.topicId);
}

export async function loadAllPredictions(): Promise<Prediction[]> {
  const rows = await getDb()
    .select({ prediction: predictions, source: sources })
    .from(predictions)
    .innerJoin(sources, eq(predictions.sourceId, sources.id));

  if (!rows.length) return [];

  const ids = rows.map(r => r.prediction.id);
  const links = await getDb()
    .select()
    .from(predictionTopics)
    .where(inArray(predictionTopics.predictionId, ids));

  const topicIdsByPrediction = new Map<string, string[]>();
  for (const link of links) {
    const list = topicIdsByPrediction.get(link.predictionId) ?? [];
    list.push(link.topicId);
    topicIdsByPrediction.set(link.predictionId, list);
  }

  return rows.map(({ prediction, source }) => toPrediction(
    prediction,
    source,
    topicIdsByPrediction.get(prediction.id) ?? [],
  ));
};

export async function insertPrediction(input: CreatePredictionInput): Promise<Prediction> {
  const source = await findOrCreateSource(input.source);
  const createdAt = normalizeTargetDate(input.created_at);
  const row = toPredictionInsert(input, source.id, createdAt);
  const { topicIds } = input;

  getDb().transaction((tx) => {
    tx.insert(predictions).values(row).run();
    if (topicIds.length > 0) {
      tx.insert(predictionTopics).values(
        topicIds.map(topicId => ({
          predictionId: row.id,
          topicId,
        })),
      ).run();
    }
  });

  return toPrediction(row, source, topicIds);
};

export async function patchPredictionOutcome(
  id: string,
  outcome: TerminalOutcome,
): Promise<Prediction | null> {
  const existing = await loadPredictionById(id);
  if (!existing) return null;
  if (existing.outcome === outcome) return existing;

  const finishedAt = new Date().toISOString();
  await getDb()
    .update(predictions)
    .set({ outcome, finishedAt })
    .where(eq(predictions.id, id));

  return { ...existing, outcome, finished_at: finishedAt };
};
