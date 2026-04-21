"use client";

import { useCallback, useState, type SubmitEvent } from "react";
import type { CreatePredictionInput } from "@/types/prediction";

type PredictionFormProps = {
  onSubmit: (input: CreatePredictionInput) => Promise<void>;
  disabled?: boolean;
};

export const PredictionForm = ({ onSubmit, disabled }: PredictionFormProps) => {
  const [source, setSource] = useState("");
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLocalError(null);
      if (!source.trim() || !text.trim()) {
        setLocalError("Source and prediction text are required.");
        return;
      }
      setSubmitting(true);
      try {
        await onSubmit({
          source: source.trim(),
          text: text.trim(),
          category: category.trim() || undefined,
          target_date: targetDate.trim() || undefined,
        });
        setSource("");
        setText("");
        setCategory("");
        setTargetDate("");
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : "Failed to save");
      } finally {
        setSubmitting(false);
      }
    },
    [source, text, category, targetDate, onSubmit],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Add a prediction
      </h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Manual entry for MVP; ingestion can replace this later.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Source (person)
          <input
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={disabled || submitting}
            placeholder="e.g. Jane Analyst"
            autoComplete="off"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Category (optional)
          <input
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={disabled || submitting}
            placeholder="Economics, Tech…"
          />
        </label>
      </div>
      <label className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Prediction
        <textarea
          className="mt-1 min-h-[88px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled || submitting}
          placeholder="What exactly are they predicting?"
        />
      </label>
      <label className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Target date (optional)
        <input
          type="date"
          className="mt-1 w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          disabled={disabled || submitting}
        />
      </label>
      {localError ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {localError}
        </p>
      ) : null}
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={disabled || submitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {submitting ? "Saving…" : "Add prediction"}
        </button>
      </div>
    </form>
  );
};
