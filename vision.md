# Project Vision: Prediction Tracker

## Overview

Prediction Tracker is a web application that collects, tracks, and evaluates predictions made by public figures (e.g., pundits, bloggers, and social media accounts) over time.

The goal is not to determine truth or intent, but to provide a transparent, data-driven view of how often predictions are correct, incorrect, or unresolved.

Capture may use **ingestion and NLP** over a **bounded allowlist of sources** (on the order of 10–20); eligibility and scoring rules stay anchored in `constitution.md`.

This project is primarily a frontend-focused application designed to demonstrate senior-level engineering practices, including scalable architecture, async data handling, and performance optimization.

---

## Goals

* Build a clean, maintainable frontend architecture using Next.js and React
* Implement a robust data-fetching layer with proper separation of concerns
* Demonstrate correct handling of asynchronous operations (including cancellation and race conditions)
* Track predictions and their outcomes over time in a structured way
* Provide clear and useful visualizations (accuracy, trends, per-source stats)
* Showcase performance optimization techniques in a real-world scenario
* Be able to clearly explain all technical decisions and tradeoffs in interviews

---

## Non-Goals (Out of Scope)

* Open-ended crawling or tracking an unlimited number of sources (scope is capped; see below)
* Determining objective “truth” of complex or ambiguous predictions
* Building a production-grade distributed backend system
* Real-time streaming infrastructure (e.g., WebSockets at scale)
* Social features (comments, likes, sharing)
* Monetization or authentication systems (for MVP)

---

## Data Acquisition (In Scope)

* **Source cap:** The product tracks a **small, explicit allowlist** of public figures or feeds — **on the order of 10–20 sources** at a time. This keeps ingestion, review, and methodology auditable.
* **NLP and automation:** Ingestion (e.g., RSS, APIs, fetched pages) plus **NLP-assisted extraction** may propose candidate predictions from unstructured text.
* **Human gate:** Candidates become official tracked predictions only after **human review** aligned with the scoring constitution (eligibility, timeframe, binary resolution). Automation reduces drudgery; it does not replace accountability.

Details of capture, review, and anti-gaming rules live in `constitution.md`.

---

## Key Constraints

* Must use Next.js (App Router) and React with TypeScript
* Must separate data fetching logic from UI components (service layer + hooks)
* Must implement request cancellation using AbortController
* Must include at least one custom hook that demonstrates closure usage (e.g., caching)
* Must handle loading, error, and empty states explicitly in the UI
* Must include measurable performance improvements (e.g., via Lighthouse or Web Vitals)
* Must be understandable and explainable without relying on external tools or frameworks

---

## Architectural Decisions

### Frontend Architecture

* Use a modular folder structure:

  * `/app` for routes
  * `/components` for UI
  * `/hooks` for stateful logic
  * `/services` for API/data access
  * `/types` for shared models
* Components should be primarily presentational, with logic extracted into hooks

### Data Flow

* All API interactions must go through a service layer
* React components must not directly perform fetch calls
* Custom hooks manage state, caching, and lifecycle

### Data Model

**Category** (browse taxonomy):

* Fixed allowlist: Tech, Sports, Politics, Finance, Weather, Historical
* Used for home category tabs, `/category/[slug]` feeds, and filter rails
* URL slug: lowercase category name (e.g. `politics`)

**Topic** (curated discovery entity):

* `id`, `slug`, `name`, `categories[]` (one or more categories for cross-listing)
* Seeded in MVP via in-memory store; not user-generated
* Drives trending rankings and `/topics/[slug]` feeds

**Prediction** includes:

* id
* source (person or account)
* text (prediction content)
* category (optional) — primary display category for cards and browse
* topicIds (array) — many-to-many links to curated topics; category filters also match predictions whose linked topics span that category
* created_at
* target_date (optional)
* outcome: `pending` (pre-resolution) or terminal values aligned with `constitution.md` §6.3: `correct`, `incorrect`, `unresolved`, `invalid`
* resolved_at (set when a terminal outcome is assigned)

**Discovery APIs (MVP):**

* `GET /api/topics` — list topics; optional `trending`, `limit`, `category`
* `GET /api/topics/[slug]` — topic detail + prediction count
* `GET /api/predictions` — supports `category`, `topic` (slug), `status`, `source`, and related filters

### Discovery Routes

* `/` — home: featured forecasts, trending topics, category tabs (in-place browse filter; optional `?category={slug}` for shareable category selection), browse list
* `/category/[slug]` — dedicated category feed (sidebar layout); also linked from forecast cards and category pills
* `/topics/[slug]` — predictions linked to that topic

### Async Handling

* Use AbortController to cancel in-flight requests when:

  * Filters change
  * Components unmount
* Prevent stale data from rendering

### Rendering Strategy

* Use a mix of server and client components where appropriate
* Prefer server-side data fetching for initial load
* Use client-side fetching for interactive updates (filters, sorting)

---

## User Experience Principles

* The UI should feel fast, even with large datasets
* Users should always understand the current state:

  * Loading
  * Error
  * Empty
* Data should be easy to scan and compare
* Visualizations should prioritize clarity over complexity
* Interactions (filtering, navigation) should feel responsive and predictable

---

## Success Criteria

The project is successful if:

### Technical

* Codebase is clean, modular, and easy to navigate
* No direct API calls inside components
* Async flows are handled correctly without race conditions
* Performance improvements are measurable and explainable
* The app handles edge cases (errors, empty states) gracefully

### Learning

* Can clearly explain:

  * Why the architecture was chosen
  * How data flows through the system
  * How closures are used in hooks
  * How AbortController prevents stale updates
  * What performance optimizations were applied and why

### Product

* Users can:

  * Add and view predictions
  * Filter predictions by source, status, category, and topic
  * Browse category and topic feed pages with sidebar context (trending, recent resolutions)
  * See accuracy metrics per source
  * Understand trends over time via charts (optional, as necessary)

---

## Future Extensions (Post-MVP)

* Raising or refining the source cap beyond the initial 10–20 allowlist (with methodology updates)
* Stronger automation (higher recall/precision, richer summarization) while keeping human review where the constitution requires it
* Admin UI and persistence for topics (MVP uses seeded in-memory topics)
* NLP-assisted topic tagging on ingest (MVP links topics manually in seed data)
* Advanced filtering and search
* Authentication and user-specific data
* More advanced analytics (confidence scoring, categories)

---

## Guiding Principle

Favor clarity, simplicity, and explainability over cleverness or complexity.

This project is a demonstration of engineering thinking, not just functionality.
