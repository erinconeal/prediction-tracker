import { outcomeLabels } from "@/components/predictions/outcome-display";
import type { TopicTab } from "@/lib/topic-tabs";
import type { Outcome } from "@/types/prediction";

export function browseEmptyMessage(
  topic: TopicTab,
  outcomeFilter: Outcome | "all",
): string {
  if (topic === "All" && outcomeFilter === "all") {
    return "No predictions match these filters.";
  }
  if (outcomeFilter !== "all" && topic !== "All") {
    return `No ${outcomeLabels[outcomeFilter].toLowerCase()} forecasts in “${topic}” yet.`;
  }
  if (outcomeFilter !== "all") {
    return `No ${outcomeLabels[outcomeFilter].toLowerCase()} forecasts in this view yet.`;
  }
  return `No predictions in “${topic}” yet.`;
}
