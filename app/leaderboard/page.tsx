import type { Metadata } from 'next';
import { LeaderboardPageView } from '@/components/leaderboard/LeaderboardPageView';

export const metadata: Metadata = {
  title: 'Leaderboard — Top predictors',
  description:
    'Sources ranked by prediction accuracy on Prediction Tracker. See track records and scored outcomes.',
};

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <LeaderboardPageView />
    </div>
  );
}
