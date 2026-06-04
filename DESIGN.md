# Design System — Prediction Tracker

## Product Context

- **What this is:** A web application that collects, tracks, and evaluates predictions made by public figures over time, with transparent scoring aligned to `constitution.md` (not “truth,” but auditable outcomes).
- **Who it's for:** Curious readers, researchers comparing sources, and builders demonstrating senior frontend practice. **Broad appeal** matters: first visit should feel inviting, not like a sealed compliance vault.
- **Space/industry:** Accountability and forecasting-adjacent tools. Peers range from **trading-market density** (e.g. Polymarket-style cards) to **institutional ledgers** (serif wordmarks, methodology-forward). This product is **neither a CLOB nor a bank terminal**: it is a **public record** with human review.
- **Project type:** Data-forward web app / dashboard (Next.js App Router, React, TypeScript).

## Memorable Thing

- **North star:** *Trust through legibility* — the UI should feel like a **public record** anyone can follow: sources, states, and rules are easy to find and scan, without cold-shouldering casual visitors.

## Aesthetic Direction

- **Direction:** **Approachable ledger** (hybrid). Combine **social legibility** (source identity, popular forecasts, recent outcomes, gentle rounding on marketing surfaces) with **trust surfaces** (persistent **Methodology**, sober tables for power users, plain-language resolution copy). Avoid **eternal ticker / full terminal chrome** on first load; optional compact “what changed” strips are fine inside pages, not as a hostile header.
- **Decoration level:** Intentional and **moderate** on **feed and marketing bands** (soft shadow, `12px` radius on hero cards); **restrained** on **dense data** (tables use **smaller radius**, flatter surfaces, priority on scan lines).
- **Mood:** Warm-canvas professional: **welcoming** first, **precise** always. Authority comes from **clear outcomes + methodology access**, not from intimidation.
- **Reference synthesis (internal benchmarks):**
  - **Trading-market density:** borrow **card rhythm**, **scannable metrics**, and **topic strips** where they improve scanning. **Do not** default to primary **trade / Yes–No** chrome; outcomes follow the constitution, not order-book metaphors.
  - **Social dashboard appeal:** borrow **avatars or source marks**, **accuracy bars with numeric labels**, **featured + recent resolution** bands. Keep **one** strong display voice (serif on titles and brand moments only).
  - **Institutional gravitas:** borrow **methodology prominence**, **ledger vocabulary** where it helps, and **table-forward** layouts for deep work. **Soften** with warmer background, fewer all-caps rails, and **plain-language** resolution summaries beside formal states.

## Typography

- **Display / hero:** **Instrument Serif** — use for site wordmark treatment (optional), page titles (`h1`), and major section headings (`h2`). Avoid in dense table cells.
- **Body:** **Source Sans 3** — labels, filters, prediction text, methodology body.
- **UI / labels:** Same as body; use weight steps (400 / 500 / 600 / 700) before adding extra sizes.
- **Data / tables:** **IBM Plex Mono** with `font-variant-numeric: tabular-nums` for IDs, dates, and numeric columns.
- **Code:** **IBM Plex Mono**.
- **Loading:** `next/font/google` subsets per route for Instrument Serif, Source Sans 3, IBM Plex Mono.
- **Scale:** display `2.25–3rem`, `h2` `1.5rem`, `h3` `1.125–1.25rem`, body **minimum 16px** for primary reading; `0.875rem` (14px) only for tertiary metadata with **7:1** contrast on its surface (`A11Y.md` density exception).

## Color

- **Approach:** **Restrained + social clarity** — neutrals and warm canvas carry structure; color marks **actions**, **links**, and **outcomes**. A secondary **interactive blue** supports “learn more / navigate” without stealing from primary actions.

| Token | Light | Dark | Usage |
|-------|-------|------|--------|
| Canvas | `#FDFCF8` | `#0C0C0D` | Page background (warmer than pure gray) |
| Surface | `#F4F4F5` | `#18181B` | Cards, sticky headers |
| Surface elevated | `#FFFFFF` | `#27272A` | Hero / marketing cards (subtle lift) |
| Text | `#18181B` | `#FAFAF9` | Primary copy |
| Muted | `#52525B` | `#A1A1AA` | Secondary labels (verify 4.5:1) |
| Ink (doc / methodology) | `#1E3A5F` | `#93C5FD` | Constitution links, long-form reference |
| Interactive | `#2563EB` | `#60A5FA` | Inline nav chips, secondary links (not primary CTA) |
| Primary (action) | `#0F766E` | `#14B8A6` | Primary buttons, key committed actions |
| Accent attention | `#B45309` | `#FBBF24` | Non-terminal emphasis |
| Success | `#15803D` | `#4ADE80` | Terminal positive |
| Warning | `#CA8A04` | `#FACC15` | Caution |
| Error | `#B91C1C` | `#F87171` | Terminal negative / errors |
| Info | `#1D4ED8` | `#93C5FA` | Informational banners |

- **Dark mode:** Reduce accent saturation ~10–20%; prefer solid surfaces over heavy shadows on cards.

## Spacing

- **Base unit:** 8px.
- **Density:** **Comfortable** on dashboards; **roomier** on hero and resolution strips so cards breathe (broader appeal).
- **Scale:** `2, 4, 8, 12, 16, 24, 32, 48, 64` px.

## Layout

- **Approach:** **Grid-disciplined hybrid** — strict columns for filters and tables; **bento-style** or horizontal **featured** bands where they help discovery.
- **Grid:** 12 columns at `lg`; stack with **filter drawer** on `sm`.
- **Max content width:** `max-w-6xl` (72rem) for main shell unless a chart needs full bleed with scroll affordance.
- **Border radius hierarchy (critical):**
  - **Marketing / feed cards:** `12px` (`rounded-xl`) default; optional `16px` for hero spotlight only.
  - **Tables, dense lists, form controls:** `4–6px` (`rounded-md` or smaller); **no** oversized bubble radius on rows.
  - **Pills / avatars:** `full`.

## Motion

- **Approach:** **Minimal-functional**; slight **entrance** on popular forecast cards is OK if it respects `prefers-reduced-motion`. The home hero uses a **static grid** (no auto-advancing carousel).
- **Easing:** enter `ease-out`, exit `ease-in`, move `ease-in-out`.
- **Duration:** micro 50–100ms, short 150–220ms, medium 250–400ms.

## Components & Patterns (non-exhaustive)

- **Outcome badges:** **Text + icon + color** (never color alone). Plain language beside formal state when space allows (e.g. “Incorrect” + `incorrect`).
- **Source rows / leaderboard:** Optional **avatar or initials** in a **40–44px** circle; **accuracy bar** with **numeric label** (`78 / 95`, `94%`). Bars are supplemental, not the only encoding.
- **Taxonomy (topics):** **Bucket topics** (Tech, Sports, Politics, Finance, Weather, Historical) power browse rails and home tabs. **Curated topics** (events, themes) link to buckets via `parentTopicIds`. Predictions link via `topicIds` only; cards show the **primary** linked topic (curated preferred over bucket). **Trending** ranks curated topics; all discovery links use **`/[slug]`** (no `/category/*`).
- **Forecast discovery cards (Popular + Browse):** Shared **shell** (`rounded-xl`, `bg-surface-elevated`, `p-5`, unified shadow). **Header:** source avatar + name link (left) with **header end** slot — Browse: **outcome badge as filter action** (per-outcome hover tint; **no** per-card pressed ring — filter state lives in **Showing: {status}** + **Clear status filter** with `role="status"`; **44px** min target; keyboard focus ring only on `:focus-visible`); Popular: compact **source accuracy badge** (`{n}%` + strength glyph ↑ ↓ —; muted **—** when unavailable; full meaning in `aria-label` / `title` — **not** clickable, **not** market odds). **Title** links to prediction detail — **not** a whole-card link. **No timing subtitle** on browse cards — outcome badge carries status; dates live on prediction detail. **Footer meta row:** muted text-only **topic** link(s) to `/[slug]` from `topicIds` (primary + optional second link / +N). Active outcome filter shows **Showing: {status}** with **Clear status filter** under the Browse heading.
- **Popular forecasts (home hero):** Responsive **single-row** card grid inside the elevated hero shell. **Trending topics** strip sits in the hero header: each item is a **curated topic** (ranked by linked prediction activity), linking to `/[slug]`; the **lead** (top-ranked) topic shows a **TrendingUp** icon. **Slot count tracks viewport:** 1 card (&lt; `lg`), 3 (`lg`–`1279px`), 4 (`xl`+); never wrap a second row. Section title: **Popular forecasts** (distinct from the main list **Browse forecasts** below), with one-line **source accuracy / not market prices** disclosure when cards are shown. Pick logic favors **newest per bucket topic** then backfill — **Popular** means editorial hero highlight, not engagement-ranked “most popular”; copy must not imply live market prices.
- **Topic feed pages:** `/[slug]` (bucket or curated) uses an **8+4 grid** at `lg`: main column is a **vertical** `PredictionFeedList` plus **Browse forecast** card; sidebar (`FeedSidebar`) holds **bucket pills**, **trending topics**, **Recently judged correct/incorrect**, and **platform stats**. Curated pages add a **page header** (name + parent bucket chips). Filters and lists must respect `prefers-reduced-motion` on any entrance animation.
- **Source detail pages:** `/source/[slug]` uses the same **8+4 grid** at `lg` (timeline main, stats sidebar). **Header:** breadcrumb (`Home / {name}` with `aria-current="page"` on the visible current item), **SourceAvatar** + serif **`h1`** + compact **SourceAccuracyBadge** beside the name (track record at first scan; not market odds). **Sidebar** (`SourceStatsSidebar`, sticky at `lg`): accuracy card with mono percent, **LeaderboardAccuracyBar**, constitution §7.3 context line (includes scored count), **total**, **Still open**, and **No longer open** counts (optional **InfoPopover** on still open / no longer open), **How we score** → `/about#lifecycle-language`. **Main column:** **Prediction feed** (`h2`) with **All** / **Still open** status filter pills, optional **Showing: {status}** + **Clear status filter** when filtered; vertical list of **Browse forecast** cards with **`hideSourceHeader`** + **`readOnlyOutcome`**. Sidebar stats use an unfiltered fetch; the feed list respects the active status filter. Empty slug-backed names use **humanized** slug fallback. Outcome scoring stays on prediction detail, not inline on this page.
- **Home bucket tabs:** `TopicBucketTabs` below the hero filter the **Browse forecasts** list **in place** on `/`. **All** clears the filter (`/` with no `topic` query). Other tabs set **`?topic={slug}`** (lowercase bucket slug, e.g. `/?topic=finance`) via `router.replace` (`scroll: false`) so filters are **shareable** without leaving home. **`/[slug]`** pages serve deep links, sidebar feeds, and card footer links. Changing bucket tab clears an active outcome status filter and scrolls the browse heading into view (`prefers-reduced-motion` respected).
- **Recently judged correct/incorrect:** Sidebar widget title; compact rows with outcome icon, pundit name, excerpt, relative time, and outcome label (no overloaded “resolved” copy). Optional **InfoPopover** on the heading. Glossary at `/about#lifecycle-language`.
- **InfoPopover (`components/ui/InfoPopover`):** Compact **inline** icon trigger (~16px visible) with **44px** expanded hit area (`::before` inset), `aria-expanded`, dismiss on Escape and outside click; `role="region"` panel for multi-sentence hints (not hover-only `title`).
- **Tables:** Sticky header optional; row hover; mono for IDs/dates; **44px** minimum hit targets for row actions (`A11Y.md`).
- **Methodology / constitution:** **First-class nav** (e.g. **Methodology** → `/about`). Never bury as FAQ-only.

## Anti-patterns (product-specific)

- Default **Yes / No trade** buttons as the primary prediction control (wrong mental model).
- **Purple gradient** marketing heroes, **three-column icon grids**, **Inter-as-default** anonymous typography.
- **All-caps** navigation rails and **black ticker** chrome on every page load (institutional overkill for casual entry).

## Static preview

- **File:** `public/design-system-preview.html` — approachable ledger patterns (featured cards, leaderboard strip, resolutions, palette, typography).

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-13 | Initial design system | Consultation + `vision.md`; forensic baseline; HTML preview. |
| 2026-05-13 | Instrument Serif + Source Sans 3 + IBM Plex Mono | Distinct from Geist; supports ledger + data. |
| 2026-05-13 | **Approachable ledger** hybrid | User direction: gravitas + broader appeal; synthesize social dashboard + institutional trust without trading-market default UI. |
| 2026-05-13 | Radius split (cards vs tables) | Visual warmth on discovery surfaces; precision on dense data. |
| 2026-05-13 | `Interactive` blue `#2563EB` | Secondary navigation / chip affordance separate from teal primary CTA. |
| 2026-05-13 | Featured carousel indicators (superseded) | `role="group"` + `aria-current` on dots (not tab/tabpanel); 44px hit targets; live region `role="status"`. Replaced 2026-05-17 by static featured grid (see below). |
| 2026-05-17 | Static featured forecast grid | Carousel removed: no moving content / pause control burden. Hero shows up to four cards with **Featured forecasts** heading; main feed uses **Browse forecasts**. Track-record metrics and sparkline disclaimers avoid order-book misread. Category icons use design tokens (`interactive`, `primary`, `ink`) — no ad-hoc violet. |
| 2026-05-17 | Unified forecast discovery card shell | Featured and Browse share layout, category chip, shadows, and multi-link interaction; Browse adds outcome filter control; Featured keeps track-record + sparkline slots. |
| 2026-05-18 | Categories vs topics + feed routes | Six fixed **categories** for rails; **topics** as curated cross-category entities with `/topics/[slug]` feeds. Trending strip and topic chips use topic slugs. Category chips on cards route to `/category/[slug]`. Feed pages use vertical list + sidebar pattern (not horizontal card carousel). |
| 2026-05-24 | Featured card accuracy framing | Per-card **Track record** / *Not live market odds* labels removed; **{n}% accurate** badge + section disclosure under **Featured forecasts** keep anti–order-book clarity with less hero noise. |
| 2026-05-24 | Discovery card hierarchy | Predictor + accuracy/filter in **header**; prediction **title** as focal body; **category · topic** (Browse) in footer as muted links without icons; Browse **dates** between title and footer; decorative **sparkline** removed. |
| 2026-05-25 | Home category tabs in place + `?category=` | Superseded 2026-05-25: unified **topic** model; home uses `TopicBucketTabs` + `?topic=`; `/category/*` removed. |
| 2026-05-25 | Unified topic taxonomy | Bucket + curated topics; predictions use `topicIds` only; `/topics/[slug]` for all feeds; roll-up browse matching for bucket slugs. |
| 2026-05-27 | Flat topic URLs | Topic feed pages at `/{slug}` (bucket and curated). `/topics/*` page route removed (pre-deploy; no redirects). Home bucket filtering remains `/?topic={slug}`. API remains `/api/topics`. |
| 2026-05-31 | Source accuracy badge glyphs | Popular cards show `{n}%` + ↑ ↓ — with track-record ARIA; unavailable uses muted **—** pill. |
| 2026-05-31 | Hero section title **Popular forecasts** | Renamed from **Featured forecasts**; **Popular** = editorial hero highlight (newest-per-bucket pick), not engagement ranking or live prices. |
| 2026-06-01 | Home **Top predictors** gating | Full podium + ledger only when ≥3 sources with scored, ≥10 scored platform-wide, and leader has ≥3 scored; otherwise insufficient-data panel with sources ranked by scored volume + link to **How we score** (`/about`). Split layout (leading + runner cards + ledger) when ≥6 rows; merged single ledger below that. Streak line when `streakLength` ≥ 2. Rows use shared **SourceAccuracyBadge**; constitution §7.3 context (scored, still open, unresolved, invalid) per row. |
| 2026-06-01 | Source detail page layout | `/source/[slug]` follows topic-feed **8+4** pattern: serif header + avatar, sticky stats sidebar (leaderboard-style accuracy), read-only browse timeline cards without inline scoring. |
| 2026-06-03 | Full leaderboard page | Dedicated `/leaderboard` route with serif page heading, **How we score** link, responsive ledger table (shared with home preview), **Load more** pagination (50-row pages), and **Leaderboard** nav item in site header. Full-rankings gating uses server-computed platform stats (`showFullRankings`, `displayStats`) so paginated slices cannot mis-gate; home preview footer links to full page with ranked-source count. On entry, focus moves to the page `h1`. |
| 2026-06-03 | Source detail header + sidebar stats | Page header adds **SourceAccuracyBadge** next to the source name; sidebar adds **Still open** count with lifecycle **InfoPopover** alongside total and **No longer open**; scored count stays in the accuracy context line only (not a separate stat card). |
| 2026-06-03 | Source detail prediction feed filter | Main column titled **Prediction feed** with **All** / **Still open** pills; sidebar stats stay on an unfiltered fetch while the feed list respects the active filter. |
