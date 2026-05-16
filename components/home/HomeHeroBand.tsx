import type { ReactNode } from "react";
import { FullBleed } from "@/components/ui/FullBleed";

type HomeHeroBandProps = {
  carousel: ReactNode;
};

export function HomeHeroBand({ carousel }: HomeHeroBandProps) {
  return (
    <FullBleed className="bg-gradient-to-b from-surface-elevated via-background to-background">
      <div className="space-y-8">
        <div className="max-w-2xl">
          <h1 className="sr-only">
            Prediction Tracker
          </h1>
        </div>
        {carousel}
      </div>
    </FullBleed>
  );
}
