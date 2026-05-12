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
          className={`mt-10 border-b border-zinc-200 pb-2 text-xl font-semibold tracking-tight text-zinc-900 first:mt-0 dark:border-zinc-800 dark:text-zinc-50 ${scrollAnchor}`}
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
          className={`mt-8 text-lg font-semibold text-zinc-900 dark:text-zinc-50 ${scrollAnchor}`}
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
          className={`mt-6 text-base font-semibold text-zinc-900 dark:text-zinc-50 ${scrollAnchor}`}
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
          className={`mt-5 text-sm font-semibold text-zinc-900 dark:text-zinc-50 ${scrollAnchor}`}
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
          className={`mt-4 text-sm font-semibold text-zinc-800 dark:text-zinc-200 ${scrollAnchor}`}
        >
          {children}
        </h6>
      );
    },
    p: ({ children }) => (
      <p className="mt-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="mt-4 list-disc space-y-2 ps-6 text-zinc-700 dark:text-zinc-300">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-2 ps-6 text-zinc-700 dark:text-zinc-300">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    hr: () => (
      <hr className="my-10 border-zinc-200 dark:border-zinc-800" />
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-4 border-s-4 border-zinc-300 ps-4 italic text-zinc-600 dark:border-zinc-600 dark:text-zinc-400">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
        {children}
      </strong>
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        className="font-medium text-zinc-900 underline decoration-zinc-400 underline-offset-4 transition-colors hover:decoration-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:text-zinc-100 dark:decoration-zinc-500 dark:hover:decoration-zinc-300 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950"
      >
        {children}
      </a>
    ),
    pre: ({ children }) => (
      <pre className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-950">
        {children}
      </pre>
    ),
    code: ({ children, className }) => {
      const isBlock = Boolean(className);
      if (isBlock) {
        return (
          <code className="block font-mono text-sm text-zinc-800 dark:text-zinc-200">
            {children}
          </code>
        );
      }
      return (
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
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
