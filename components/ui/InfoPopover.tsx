'use client';

import { Info } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type InfoPopoverTone = 'default' | 'onPrimary';

type InfoPopoverProps = {
  /** Accessible name for the trigger (e.g. "About no longer open count"). */
  label: string;
  children: ReactNode;
  className?: string;
  tone?: InfoPopoverTone;
};

const triggerToneStyles: Record<InfoPopoverTone, string> = {
  default:
    'text-muted hover:bg-surface hover:text-foreground',
  onPrimary:
    'text-white/85 hover:bg-white/10 hover:text-white',
};

export function InfoPopover({
  label,
  children,
  className = '',
  tone = 'default',
}: InfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    };

    const onPointerDown = (event: MouseEvent) => {
      const root = rootRef.current;
      if (root && !root.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} className={`relative inline-flex ${className}`.trim()}>
      <button
        type="button"
        className={`relative inline-flex size-4 shrink-0 items-center justify-center rounded-sm before:absolute before:-inset-3.5 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background ${triggerToneStyles[tone]}`}
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          setOpen(prev => !prev);
        }}
      >
        <Info className="relative size-3.5" aria-hidden strokeWidth={1.75} />
      </button>
      {open
        ? (
            <div
              id={panelId}
              role="region"
              aria-label={label}
              className="absolute end-0 top-full z-20 mt-1 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-border bg-surface-elevated p-3 text-xs leading-relaxed text-muted shadow-md"
            >
              {children}
            </div>
          )
        : null}
    </div>
  );
}
