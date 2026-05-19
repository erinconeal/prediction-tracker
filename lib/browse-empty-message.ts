import { outcomeLabels } from "@/components/predictions/outcome-display";
import type { CategoryTab } from "@/lib/category-tabs";
import type { Outcome } from "@/types/prediction";

export function browseEmptyMessage(
  categoryTab: CategoryTab,
  outcomeFilter: Outcome | "all",
): string {
  if (categoryTab === "All" && outcomeFilter === "all") {
    return "No predictions match these filters.";
  }
  if (outcomeFilter !== "all" && categoryTab !== "All") {
    return `No ${outcomeLabels[outcomeFilter].toLowerCase()} forecasts in “${categoryTab}” yet.`;
  }
  if (outcomeFilter !== "all") {
    return `No ${outcomeLabels[outcomeFilter].toLowerCase()} forecasts in this view yet.`;
  }
  return `No predictions in “${categoryTab}” yet.`;
}
