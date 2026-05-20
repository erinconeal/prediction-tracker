import type { ReactNode } from 'react';

export type CategoryDisplay = {
  label: string;
  icon: ReactNode;
  iconWrapClass: string;
};

function FinanceIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 12V6M7 12V3M11 12V8M14 12H2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function TechIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="4"
        y="5"
        width="8"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="6.5" cy="3" r="1" fill="currentColor" />
      <circle cx="9.5" cy="3" r="1" fill="currentColor" />
    </svg>
  );
}

function PoliticsIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 2v12M5 5h6M4 14h8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function DefaultIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const CATEGORY_RULES: {
  match: RegExp;
  display: Omit<CategoryDisplay, 'label'> & { label?: string };
}[] = [
  {
    match: /finance|fed|rate|market|econom/i,
    display: {
      icon: <FinanceIcon />,
      iconWrapClass: 'bg-interactive/10 text-interactive',
    },
  },
  {
    match: /tech|ai|software|crypto|bitcoin/i,
    display: {
      icon: <TechIcon />,
      iconWrapClass: 'bg-primary/10 text-primary',
    },
  },
  {
    match: /politic|election|debate|president|congress/i,
    display: {
      icon: <PoliticsIcon />,
      iconWrapClass: 'bg-ink/10 text-ink',
    },
  },
];

export function categoryDisplayFromName(
  category: string | null | undefined,
): CategoryDisplay {
  const raw = category?.trim() || 'General';
  const label = raw.toUpperCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.match.test(raw)) {
      return {
        label: rule.display.label ?? label,
        icon: rule.display.icon,
        iconWrapClass: rule.display.iconWrapClass,
      };
    }
  }

  return {
    label,
    icon: <DefaultIcon />,
    iconWrapClass: 'bg-surface text-muted ring-1 ring-border',
  };
}
