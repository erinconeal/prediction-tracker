# Project Vision: Prediction Tracker

## Overview

Prediction Tracker is a web application that collects, tracks, and evaluates predictions made by public figures (e.g., pundits, bloggers, and social media accounts) over time.

The goal is not to determine truth or intent, but to provide a transparent, data-driven view of how often predictions are correct, incorrect, or unresolved.

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

* Fully automated extraction of predictions from unstructured text
* Determining objective “truth” of complex or ambiguous predictions
* Building a production-grade distributed backend system
* Real-time streaming infrastructure (e.g., WebSockets at scale)
* Social features (comments, likes, sharing)
* Monetization or authentication systems (for MVP)

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

A prediction includes:

* id
* source (person or account)
* text (prediction content)
* category (optional)
* created_at
* target_date (optional)
* outcome (pending | correct | incorrect)

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
  * Filter predictions by source and status
  * See accuracy metrics per source
  * Understand trends over time via charts

---

## Future Extensions (Post-MVP)

* API/RSS ingestion of real-world data
* AI-assisted prediction extraction and summarization
* Tagging and categorization improvements
* Advanced filtering and search
* Authentication and user-specific data
* More advanced analytics (confidence scoring, categories)

---

## Guiding Principle

Favor clarity, simplicity, and explainability over cleverness or complexity.

This project is a demonstration of engineering thinking, not just functionality.
