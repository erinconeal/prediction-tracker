import type { Category } from "@/types/category";
import type { Topic } from "@/types/topic";
import { slugify } from "@/utils/slugify";

const topics: Topic[] = [];

function topicId(slug: string): string {
  return `topic-${slug}`;
}

function seedTopics(): void {
  if (topics.length > 0) return;

  const rows: Omit<Topic, "id">[] = [
    {
      slug: "midterm-elections-2026",
      name: "Midterm elections 2026",
      categories: ["Politics"],
    },
    {
      slug: "world-cup-2026-winner",
      name: "World Cup 2026 winner",
      categories: ["Sports"],
    },
    {
      slug: "sp-hits-8000",
      name: "S&P hits 8000",
      categories: ["Finance"],
    },
    {
      slug: "ai-regulation-2026",
      name: "AI regulation 2026",
      categories: ["Tech", "Politics"],
    },
    {
      slug: "housing-market-2026",
      name: "Housing market 2026",
      categories: ["Finance"],
    },
    {
      slug: "ev-adoption-2030",
      name: "EV adoption 2030",
      categories: ["Tech", "Finance"],
    },
    {
      slug: "atlantic-hurricane-season-2026",
      name: "Atlantic hurricane season 2026",
      categories: ["Weather"],
    },
    {
      slug: "fed-independence-2027",
      name: "Fed independence 2027",
      categories: ["Finance", "Politics"],
    },
    {
      slug: "great-depression-analog",
      name: "Great Depression analog",
      categories: ["Historical", "Finance"],
    },
  ];

  for (const row of rows) {
    topics.push({
      id: topicId(row.slug),
      ...row,
    });
  }
}

export function listTopics(): Topic[] {
  seedTopics();
  return [...topics];
}

export function getTopicBySlug(slug: string): Topic | null {
  seedTopics();
  const norm = slug.trim().toLowerCase();
  return topics.find((t) => t.slug === norm) ?? null;
}

export function getTopicById(id: string): Topic | null {
  seedTopics();
  return topics.find((t) => t.id === id) ?? null;
}

export function getTopicsByIds(ids: string[]): Topic[] {
  seedTopics();
  const set = new Set(ids);
  return topics.filter((t) => set.has(t.id));
}

export function listTopicsForCategory(category: Category): Topic[] {
  seedTopics();
  return topics.filter((t) => t.categories.includes(category));
}

/** Resolve topic IDs to topics; unknown IDs are skipped. */
export function resolveTopicIds(ids: string[]): Topic[] {
  return getTopicsByIds(ids);
}

/** Primary display category from first linked topic, else explicit category string. */
export function primaryCategoryFromTopics(
  topicIds: string[],
  explicitCategory: string | null | undefined,
): string | null {
  if (explicitCategory?.trim()) return explicitCategory.trim();
  const linked = getTopicsByIds(topicIds);
  if (linked.length === 0) return null;
  return linked[0]!.categories[0] ?? null;
}

export function ensureTopicSlug(name: string): string {
  return slugify(name);
}
