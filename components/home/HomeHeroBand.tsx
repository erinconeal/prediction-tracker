import type { ReactNode } from 'react';
import { FullBleed } from '@/components/ui/FullBleed';

type HomeHeroBandProps = {
  children: ReactNode;
};

export function HomeHeroBand({ children }: HomeHeroBandProps) {
  return (
    <FullBleed className="bg-gradient-to-b from-surface-elevated via-background to-background">
      <div className="space-y-8">
        {children}
      </div>
    </FullBleed>
  );
}
