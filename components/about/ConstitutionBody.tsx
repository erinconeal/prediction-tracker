import type { Components } from "react-markdown";
import Markdown from "react-markdown";
import type { MethodologyTocEntry, MethodologyTocLevel } from "@/lib/methodology-toc";

function createMarkdownComponents(
  toc: readonly MethodologyTocEntry[],
): Components {
  const queue = [...toc];

  const takeId = (level: MethodologyTocLevel): string | undefined => {
    const next = queue[0];
    if (next?.level !== level) return undefined;
    queue.shift();
    return next.id;
  };

  const scrollAnchor = "scroll-mt-24";

  return {
    h2: ({ children }) => {
      const id = takeId(2);
      return (
        <h2
          id={id}
          className={`mt-10 border-b border-border pb-2 font-serif text-xl font-normal tracking-tight text-foreground first:mt-0 ${scrollAnchor}`}
        >
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const id = takeId(3);
      return (
        <h3
          id={id}
          className={`mt-8 text-lg font-semibold text-foreground ${scrollAnchor}`}
        >
          {children}
        </h3>
      );
    },
    h4: ({ children }) => {
      const id = takeId(4);
      return (
        <h4
          id={id}
          className={`mt-6 text-base font-semibold text-foreground ${scrollAnchor}`}
        >
          {children}
        </h4>
      );
    },
    h5: ({ children }) => {
      const id = takeId(5);
      return (
        <h5
          id={id}
          className={`mt-5 text-sm font-semibold text-foreground ${scrollAnchor}`}
        >
          {children}
        </h5>
      );
    },
    h6: ({ children }) => {
      const id = takeId(6);
      return (
        <h6
          id={id}
          className={`mt-4 text-sm font-semibold text-foreground ${scrollAnchor}`}
        >
          {children}
        </h6>
      );
    },
    p: ({ children }) => (
      <p className="mt-4 text-base leading-relaxed text-foreground/90">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="mt-4 list-disc space-y-2 ps-6 text-foreground/90">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-2 ps-6 text-foreground/90">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    hr: () => <hr className="my-10 border-border" />,
    blockquote: ({ children }) => (
      <blockquote className="mt-4 border-s-4 border-border ps-4 italic text-muted">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        className="font-medium text-ink underline decoration-border underline-offset-4 transition-colors hover:text-interactive hover:decoration-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {children}
      </a>
    ),
    pre: ({ children }) => (
      <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-surface p-4 text-sm">
        {children}
      </pre>
    ),
    code: ({ children, className }) => {
      const isBlock = Boolean(className);
      if (isBlock) {
        return (
          <code className="block font-mono text-sm text-foreground">
            {children}
          </code>
        );
      }
      return (
        <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.9em] text-foreground">
          {children}
        </code>
      );
    },
  };
}

type ConstitutionBodyProps = {
  markdown: string;
  toc: readonly MethodologyTocEntry[];
};

export function ConstitutionBody({ markdown, toc }: ConstitutionBodyProps) {
  const components = createMarkdownComponents(toc);

  return (
    <div className="constitution-markdown max-w-3xl">
      {/* react-markdown omits raw HTML by default; avoid rehype-raw or similar — repo-controlled MD only */}
      <Markdown components={components}>{markdown}</Markdown>
    </div>
  );
}
