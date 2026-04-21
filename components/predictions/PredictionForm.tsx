"use client";

import { useCallback, useId, useState, type SubmitEvent } from "react";
import type { CreatePredictionInput } from "@/types/prediction";

type PredictionFormProps = {
  onSubmit: (input: CreatePredictionInput) => Promise<void>;
  disabled?: boolean;
};

export const PredictionForm = ({ onSubmit, disabled }: PredictionFormProps) => {
  const id = useId();
  const sourceFieldId = `${id}-source`;
  const categoryFieldId = `${id}-category`;
  const textFieldId = `${id}-text`;
  const dateFieldId = `${id}-date`;
  const hintId = `${id}-hint`;

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
      aria-describedby={hintId}
      className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Add a prediction
      </h2>
      <p id={hintId} className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
        Manual entry for MVP; ingestion can replace this later.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <label
            htmlFor={sourceFieldId}
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Source (person)
          </label>
          <input
            id={sourceFieldId}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus-visible:border-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={disabled || submitting}
            placeholder="e.g. Jane Analyst"
            autoComplete="off"
          />
        </div>
        <div className="min-w-0">
          <label
            htmlFor={categoryFieldId}
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Category (optional)
          </label>
          <input
            id={categoryFieldId}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus-visible:border-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={disabled || submitting}
            placeholder="Economics, Tech…"
          />
        </div>
      </div>
      <label
        htmlFor={textFieldId}
        className="mt-4 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
      >
        Prediction
      </label>
      <textarea
        id={textFieldId}
        className="mt-1 min-h-[88px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus-visible:border-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled || submitting}
        placeholder="What exactly are they predicting?"
      />
      <label
        htmlFor={dateFieldId}
        className="mt-4 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
      >
        Target date (optional)
      </label>
      <input
        id={dateFieldId}
        type="date"
        className="mt-1 w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus-visible:border-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
        value={targetDate}
        onChange={(e) => setTargetDate(e.target.value)}
        disabled={disabled || submitting}
      />
      {localError ? (
        <p
          className="mt-3 text-sm text-red-800 dark:text-red-200"
          role="alert"
          aria-live="polite"
        >
          {localError}
        </p>
      ) : null}
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={disabled || submitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-900"
        >
          {submitting ? "Saving…" : "Add prediction"}
        </button>
      </div>
    </form>
  );
};
