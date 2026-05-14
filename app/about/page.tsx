import type { Metadata } from "next";
import { ConstitutionBody } from "@/components/about/ConstitutionBody";
import { MethodologyTableOfContents } from "@/components/about/MethodologyTableOfContents";
import {
  readConstitutionMarkdown,
  readLeadingAtxHeadingText,
  stripLeadingAtxHeading,
} from "@/lib/constitution";
import { extractMethodologyToc } from "@/lib/methodology-toc";

export const metadata: Metadata = {
  title: "About — Methodology",
  description:
    "How Prediction Tracker scores predictions: eligibility, resolution, accuracy, and transparency rules from the scoring constitution.",
};

export default async function AboutPage() {
  const raw = await readConstitutionMarkdown();
  const documentTitle = readLeadingAtxHeadingText(raw);
  const markdown = stripLeadingAtxHeading(raw);
  const toc = extractMethodologyToc(markdown);

  return (
    <div className="space-y-8 scroll-smooth">
      <header className="max-w-3xl space-y-3">
        <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground">
          About
        </h1>
        {documentTitle ? (
          <p className="text-sm font-medium text-muted">{documentTitle}</p>
        ) : null}
        <p className="text-lg leading-relaxed text-muted">
          This page publishes the full{" "}
          <span className="font-medium text-foreground">scoring constitution</span>
          : the canonical methodology for what counts as a prediction, how
          outcomes are assigned, and how accuracy is reported. Metrics in the app
          follow these rules.
        </p>
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(12rem,14rem)_minmax(0,1fr)] xl:items-start">
        <MethodologyTableOfContents entries={toc} />
        <section
          aria-label="Methodology"
          className="min-w-0 rounded-xl border border-border bg-surface-elevated p-6 shadow-sm sm:p-8"
        >
          <ConstitutionBody markdown={markdown} toc={toc} />
        </section>
      </div>
    </div>
  );
}
