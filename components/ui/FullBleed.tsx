import type { ReactNode } from 'react';

type FullBleedProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Breaks out of the `max-w-6xl` main column to span the viewport width while
 * keeping inner content aligned to the same horizontal padding as the shell.
 */
export function FullBleed({ children, className = '' }: FullBleedProps) {
  return (
    <section
      className={`relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 ${className}`.trim()}
    >
      <div className="mx-auto w-full max-w-6xl px-4">{children}</div>
    </section>
  );
}
