"use client";

import { memo, type ReactNode } from "react";
import { PopularForecastsSection } from "@/components/home/PopularForecastsSection";
import type { CategoryTab } from "@/lib/category-tabs";
import type { Prediction } from "@/types/prediction";

const HERO_CARD_SHELL_CLASS =
  "flex flex-col overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-[0_4px_24px_rgb(0_0_0/0.07)]";

type HomeHeroCardProps = {
  header?: ReactNode;
  popularForecasts: Prediction[];
  statsContext: Prediction[];
  slotCount: number;
  loading?: boolean;
  onCategorySelect?: (tab: CategoryTab) => void;
  className?: string;
};

export const HomeHeroCard = memo(function HomeHeroCard({
  header,
  popularForecasts,
  statsContext,
  slotCount,
  loading = false,
  onCategorySelect,
  className = "",
}: HomeHeroCardProps) {
  return (
    <section
      className={`${HERO_CARD_SHELL_CLASS} ${className}`.trim()}
      aria-labelledby="featured-forecasts-heading"
    >
      {header}
      <PopularForecastsSection
        predictions={popularForecasts}
        statsContext={statsContext}
        slotCount={slotCount}
        loading={loading}
        onCategorySelect={onCategorySelect}
      />
    </section>
  );
});
