This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install dependencies and set up the database (see [Database](#database)), then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database

This project uses **SQLite** with [Drizzle ORM](https://orm.drizzle.team/) for persistence. Schema lives in `lib/schema.ts`; migrations live in `drizzle/`.

### Prerequisites

- Node.js and `npm install` completed
- Native build support for `better-sqlite3` (standard on macOS/Linux; Windows may need build tools)

### First-time setup

1. Copy the env template (optional — defaults work without a `.env` file):

   ```bash
   cp .env.example .env.local
   ```

2. Create the data directory:

   ```bash
   mkdir -p data
   ```

3. Apply migrations (creates `data/prediction-tracker.sqlite` if it does not exist):

   ```bash
   npm run db:migrate
   ```

4. Seed demo topics and predictions (skips if data already exists):

   ```bash
   npm run db:seed
   ```

   Use `npm run db:seed -- --force` to wipe topics/predictions and re-seed Jane.
   Use `npm run db:clear-predictions` to delete quotes and people while keeping topics (does not re-seed Jane).

5. Start the app:

   ```bash
   npm run dev
   ```

The SQLite file is gitignored (`data/*.sqlite`). Do not commit database files — only migration SQL in `drizzle/`.

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `./data/prediction-tracker.sqlite` | Path to the SQLite database file |
| `STAFF_SECRET` | | Shared password for staff writes for APIs |

See [`.env.example`](.env.example).

### npm scripts

| Script | Purpose |
|--------|---------|
| `npm run db:migrate` | Apply pending migrations to the database |
| `npm run db:generate` | Generate a new migration after changing `lib/schema.ts` |
| `npm run db:studio` | Open Drizzle Studio (visual browser for the DB) |
| `npm run db:seed` | Seed demo topics and predictions (`--force` to re-seed) |
| `npm run db:clear-predictions` | Delete predictions and sources; keep topics (does not re-seed Jane) |

### Changing the schema

1. Edit `lib/schema.ts`
2. Generate a migration:

   ```bash
   npm run db:generate
   ```

3. Review the new SQL under `drizzle/`
4. Apply it:

   ```bash
   npm run db:migrate
   ```

5. Add or update integration tests in `lib/schema.*.integration.test.ts`

### App code usage

- **`getDb()`** — singleton for API routes and repositories (lazy init, FK enforcement on)
- **`createDb(url)`** — explicit connection for tests and scripts (e.g. `:memory:`)

Import from `@/lib/db`. Do not import DB code from client components — `better-sqlite3` is server-only.

### Testing

Integration tests use an in-memory database via `createMigratedTestDb()` in [`test/helpers/create-test-db.ts`](test/helpers/create-test-db.ts). Broader test conventions live in [`test/README.md`](test/README.md).

Run DB-related tests:

```bash
npm run test:run -- lib/schema
```

Run the full validation suite (lint + tests):

```bash
npm run validate
```

### Deployment note

The default SQLite file path is for **local development**. API routes already use `getDb()` against that file. Serverless hosts (e.g. Vercel) do not persist a local SQLite file — for production, plan a hosted database (e.g. Turso/libSQL, Postgres) and point `DATABASE_URL` (or an equivalent driver) at it.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

You can deploy the Next.js app on the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme), but the default local SQLite file will not persist there — see [Deployment note](#deployment-note) under Database.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
