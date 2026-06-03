import {
  LIFECYCLE_GLOSSARY_ANCHOR,
  LIFECYCLE_GLOSSARY_ENTRIES,
  LIFECYCLE_GLOSSARY_HEADING,
} from '@/lib/lifecycle-copy';

export function LifecycleLanguage() {
  return (
    <section
      id={LIFECYCLE_GLOSSARY_ANCHOR}
      aria-labelledby="lifecycle-language-heading"
      className="max-w-3xl scroll-mt-24 rounded-xl border border-border bg-surface-elevated p-6 shadow-sm sm:p-8"
    >
      <h2
        id="lifecycle-language-heading"
        className="font-serif text-xl font-normal tracking-tight text-foreground"
      >
        {LIFECYCLE_GLOSSARY_HEADING}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Short definitions for labels you see in the app. The full scoring rules
        are in the constitution below.
      </p>
      <dl className="mt-6 space-y-4">
        {LIFECYCLE_GLOSSARY_ENTRIES.map(({ term, meaning }) => (
          <div key={term}>
            <dt className="text-sm font-medium text-foreground">{term}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted">{meaning}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
