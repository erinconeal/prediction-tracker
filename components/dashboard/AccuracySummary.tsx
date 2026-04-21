"use client";

import { memo, useMemo } from "react";
import type { Prediction } from "@/types/prediction";

type AccuracySummaryProps = {
  predictions: Prediction[];
};

function computeStats(predictions: Prediction[]) {
  const bySource = new Map<
    string,
    { total: number; resolved: number; correct: number }
  >();
  for (const p of predictions) {
    const cur = bySource.get(p.source) ?? {
      total: 0,
      resolved: 0,
      correct: 0,
    };
    cur.total += 1;
    if (p.outcome !== "pending") {
      cur.resolved += 1;
      if (p.outcome === "correct") cur.correct += 1;
    }
    bySource.set(p.source, cur);
  }
  const rows = [...bySource.entries()].map(([source, s]) => ({
    source,
    total: s.total,
    accuracy:
      s.resolved === 0 ? null : Math.round((s.correct / s.resolved) * 1000) / 10,
  }));
  rows.sort((a, b) => b.total - a.total);
  return rows;
}

export const AccuracySummary = memo(function AccuracySummary({
  predictions,
}: AccuracySummaryProps) {
  const rows = useMemo(() => computeStats(predictions), [predictions]);
  if (rows.length === 0) return null;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Accuracy by source
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              <th className="pb-2 font-medium">Source</th>
              <th className="pb-2 font-medium">Total</th>
              <th className="pb-2 font-medium">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.source}
                className="border-b border-zinc-100 dark:border-zinc-800"
              >
                <td className="py-2 font-medium text-zinc-900 dark:text-zinc-100">
                  {r.source}
                </td>
                <td className="py-2 text-zinc-600 dark:text-zinc-400">
                  {r.total}
                </td>
                <td className="py-2 text-zinc-600 dark:text-zinc-400">
                  {r.accuracy === null ? "—" : `${r.accuracy}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
