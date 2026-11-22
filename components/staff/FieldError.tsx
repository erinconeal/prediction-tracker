'use client';

import { CircleX } from 'lucide-react';

export function FieldError({ id, message, className }: { id: string; message?: string; className?: string }) {
  if (!message) return null;
  return (
    <p id={id} className={`border-error/35 bg-error/10 text-error flex items-center gap-2 pl-2 ${className ?? ''}`}>
      <CircleX className="size-3 shrink-0 stroke-current" aria-hidden strokeWidth={1.75} />
      {message}
    </p>
  );
}
