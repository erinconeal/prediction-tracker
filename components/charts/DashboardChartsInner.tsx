"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  AccuracyPoint,
  OutcomeSlice,
  SourceCount,
} from "@/components/charts/chart-data";

export type DashboardChartsInnerProps = {
  accuracyOverTime: AccuracyPoint[];
  perSource: SourceCount[];
  outcomeSplit: OutcomeSlice[];
};

export function DashboardChartsInner({
  accuracyOverTime,
  perSource,
  outcomeSplit,
}: DashboardChartsInnerProps) {
  const hasTime = accuracyOverTime.length > 0;
  const hasBar = perSource.length > 0;
  const hasPie = outcomeSplit.length > 0;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Accuracy over time (by creation month, resolved only)
        </h3>
        {hasTime ? (
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyOverTime} margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={40} />
                <Tooltip
                  formatter={(value) =>
                    value === null || value === undefined
                      ? ["—", "Accuracy"]
                      : [`${Number(value).toFixed(1)}%`, "Accuracy"]
                  }
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Not enough resolved predictions with dates to chart.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Predictions per source
        </h3>
        {hasBar ? (
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perSource} layout="vertical" margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="source" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No data.</p>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Win / loss / pending
        </h3>
        {hasPie ? (
          <div className="mx-auto h-64 max-w-md min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomeSplit}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={88}
                  label
                />
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No data.</p>
        )}
      </section>
    </div>
  );
}
