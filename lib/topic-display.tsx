import {
  BarChart3,
  Circle,
  CloudSun,
  Cpu,
  History,
  Landmark,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

export type TopicDisplay = {
  label: string;
  icon: ReactNode;
  iconWrapClass: string;
};

const TOPIC_ICON_CLASS = 'size-4 shrink-0';

function topicIcon(Icon: LucideIcon): ReactNode {
  return (
    <Icon className={TOPIC_ICON_CLASS} aria-hidden strokeWidth={1.75} />
  );
}

const TOPIC_RULES: {
  match: RegExp;
  display: {
    Icon: LucideIcon;
    iconWrapClass: string;
    label?: string;
  };
}[] = [
  {
    match: /finance|fed|rate|market|econom/i,
    display: {
      Icon: BarChart3,
      iconWrapClass: 'bg-interactive/10 text-interactive',
    },
  },
  {
    match: /tech|ai|software|crypto|bitcoin/i,
    display: {
      Icon: Cpu,
      iconWrapClass: 'bg-primary/10 text-primary',
    },
  },
  {
    match: /politic|election|debate|president|congress/i,
    display: {
      Icon: Landmark,
      iconWrapClass: 'bg-ink/10 text-ink',
    },
  },
  {
    match: /^sports?$|sport|league|tournament|championship|olympic/i,
    display: {
      Icon: Trophy,
      iconWrapClass: 'bg-accent-attention/15 text-accent-attention',
    },
  },
  {
    match: /weather|climate|storm|hurricane|temperature/i,
    display: {
      Icon: CloudSun,
      iconWrapClass: 'bg-info/10 text-info',
    },
  },
  {
    match: /histor|archaeolog|ancient|century|era\b|past events/i,
    display: {
      Icon: History,
      iconWrapClass: 'bg-muted/15 text-muted',
    },
  },
];

export function topicDisplayFromName(
  name: string | null | undefined,
): TopicDisplay {
  const label = name?.trim() || 'General';

  for (const rule of TOPIC_RULES) {
    if (rule.match.test(label)) {
      return {
        label: rule.display.label ?? label,
        icon: topicIcon(rule.display.Icon),
        iconWrapClass: rule.display.iconWrapClass,
      };
    }
  }

  return {
    label,
    icon: topicIcon(Circle),
    iconWrapClass: 'bg-surface text-muted ring-1 ring-border',
  };
}
