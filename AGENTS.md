# Repository Guidelines

## Project Structure & Module Organization

OpenRisk is a Nuxt, TypeScript, and Tailwind CSS app for neutral DeFi risk intelligence. App routes live in `app/pages`, components in `app/components`, composables in `app/composables`, and global styles in `app/assets/css/main.css`. API handlers are under `server/api`, with data loading in `server/utils/openrisk-data.ts`. Canonical registry data lives in `data/**/seed.yaml`, schemas and shared types are in `shared/openrisk.ts`, and generated output is `public/data/openrisk.json`. Unit tests live in `tests/unit/**/*.spec.ts`.

## Build, Test, and Development Commands

Use pnpm 10 (`packageManager` is `pnpm@10.15.1`).

- `pnpm install`: install dependencies and run Nuxt preparation.
- `pnpm run dev`: start the Nuxt development server.
- `pnpm run static:data`: regenerate `public/data/openrisk.json` from YAML seeds.
- `pnpm run build`: regenerate static data and build the Nuxt app.
- `pnpm run typecheck`: run Nuxt/Vue TypeScript checks.
- `pnpm run lint`: run ESLint.
- `pnpm run validate:data`: validate YAML registry data against Zod schemas.
- `pnpm run check:no-scoring`: ensure the project does not introduce rankings, scores, or composites.
- `pnpm run test`: run Vitest unit tests.

## Coding Style & Naming Conventions

Use TypeScript and Vue single-file components following existing Nuxt conventions. Prefer `script setup lang="ts"` for Vue files and two-space indentation in templates. IDs in data files must be lowercase kebab-case (`aave`, `rocket-pool`) and match the schema regex in `shared/openrisk.ts`. Do not add OpenRisk-authored scores, normalized ratings, rankings, or composite risk fields.

## Testing Guidelines

Vitest runs in a Node environment and includes `tests/unit/**/*.spec.ts`. Add or update tests when changing data generation, schemas, or API-facing dataset behavior. Before data changes, run `pnpm run validate:data`, `pnpm run check:no-scoring`, and `pnpm run test`; for app code, also run `pnpm run typecheck` and `pnpm run lint`.

## Commit & Pull Request Guidelines

The current history is minimal, so use short imperative commit subjects such as `add feed validation` or `fix protocol detail copy`. Pull requests should describe the user-visible or data-model change, link relevant issues, and include screenshots for UI changes. Data correction PRs must include protocol id, feed id, proposed status, dated source URL, and a clear distinction between provider-authored text and curator notes.

## Security & Configuration Tips

Do not commit secrets or credentials. Treat `data/**/seed.yaml` as the canonical source and `public/data/openrisk.json` as generated output. Covered and partial cells require dated sources; provider text must remain attributed and unedited.
