# OpenRisk

OpenRisk is a neutral DeFi risk intelligence aggregator for Ethereum mainnet protocols. It presents what independent risk feeds say about protocols side by side, without producing composite scores, rankings, or editorial synthesis.

See `IMPLEMENTATION_PLAN.md` for architecture, UX behavior, delivery phases, and RFP requirements traceability.

## Stack

- Nuxt, TypeScript, Tailwind CSS
- TanStack Table for search results and the protocol-by-feed matrix
- Zod and YAML for the repo-native data layer

## Data Model

Canonical data lives in `data/` and is validated by `shared/openrisk.ts`.

- `data/protocols`: seed protocols and DefiLlama mappings
- `data/feeds`: provider registry and methodology one-liners
- `data/coverage`: sourced curator notes and optional provider-authored text; missing cells are generated as `not_covered`
- `data/governance`: sourced governance facts
- `data/audits` and `data/incidents`: security references

`pnpm run build` refreshes DefiLlama metrics, writes a complete snapshot to
`public/data/openrisk.json`, and prerenders the application with Nitro's
`vercel-static` preset. The browser does not fetch canonical data during hydration.

## Development

```bash
pnpm install
pnpm run dev
pnpm run validate:data
pnpm run check:no-scoring
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
pnpm run test:e2e
```

## Deployment

```bash
pnpm run build
npx vercel deploy --prebuilt
```

The build produces a static `.vercel/output` with no request-time server function.

## Correction Process

Open an issue or pull request with:

- Protocol id/name
- Feed id/name
- Exact coverage status change
- Provider-authored text where applicable, clearly distinguished from curator notes
- Source URL and capture date

Covered and partial cells require a dated source. OpenRisk-created scores, rankings, normalized ratings, or composite fields are rejected.

## License

AGPL-3.0-or-later. See `LICENSE`.
