# OpenRisk Implementation Plan

This plan translates `OpenRisk_RFP_v0.pdf` into a maintainable v1 product. It also records what is implemented, how it is verified, and which launch obligations remain outside the codebase.

## Product Principles

1. OpenRisk aggregates attributed provider material; it does not create a risk score, ranking, or editorial verdict.
2. Every positive coverage claim must have provenance that a reviewer can inspect.
3. Missing information is explicit. `not_covered`, `partial`, stale, and unavailable states must never be presented as equivalent.
4. The full protocol-by-feed dataset remains inspectable and correctable in the public repository.
5. Search and comparison are the primary workflows. The interface is dense, quiet, and optimized for repeated research.

## V1 Scope

- 20 Ethereum mainnet DeFi protocols.
- 16 independent risk or security information feeds.
- A complete 20 x 16 coverage matrix with `covered`, `partial`, and `not_covered` states.
- Protocol profiles with provider coverage, governance provenance, audits, incidents, and build-time DefiLlama metric snapshots.
- Feed profiles with methodology context and covered protocols.
- Public methodology, contribution, project-charter, licensing, and stewardship documents.
- No user accounts, write API, administrative dashboard, composite scoring, or multi-chain expansion in v1.

## Architecture

### Application

- Nuxt 4 with Vue 3 and strict TypeScript.
- Tailwind CSS 4 for design tokens and responsive utility styling.
- TanStack Table for sortable and filterable registry and matrix views.
- Nitro's `vercel-static` preset for a fully prerendered Vercel output.
- A generated JSON snapshot imported synchronously by the app, with no hydration-time data request.

### Canonical Data

- YAML files in `data/` are the source of truth for curated records.
- Zod schemas in `shared/openrisk.ts` validate all records.
- Coverage is materialized into all 320 protocol-feed combinations at load time.
- `covered` and `partial` records require a source URL, capture date, and curated summary.
- Provider-authored text is stored separately from curator-authored coverage notes.
- DefiLlama identifiers are stored on protocol records rather than inferred from display names.

### Release Data

- The build pipeline requests Ethereum TVL and aggregator volume data from DefiLlama.
- The generated snapshot includes all protocol, feed, matrix, governance, audit, incident, and metric records.
- The frontend imports that snapshot synchronously, so the first server-rendered HTML already contains canonical data.
- If DefiLlama is unavailable during a build, the last valid metric snapshot is preserved instead of producing blank pages.

## Information Architecture

### Search

The default route is the operational starting point.

- Prominent text search across protocol name, description, category, version, and governance context.
- Category and coverage filters.
- Sortable protocol, category, and coverage columns.
- Compact feed-status scan for each result.
- Responsive desktop table and mobile protocol list.

### Matrix

- Full protocol-by-feed comparison without hidden cells.
- Sticky protocol column and horizontally scrollable feed columns.
- Status legend and status filtering.
- Cell selection opens the evidence summary and provenance.
- Direct links to protocol and feed profiles preserve research context.

### Protocol Profile

- Identity, category, versions, and official links.
- Build-time TVL or volume snapshot with source, capture date, and scope notes where needed.
- Feed coverage with clearly separated curated notes and provider-authored text.
- Governance mechanism, control, upgrade, and source facts.
- Audit and incident references.

### Feed Profile

- Provider identity and official source.
- Short methodology description.
- Coverage counts and covered protocol list.
- Attributed source and capture-date context.

### Methodology And Corrections

- Status definitions and provenance legend.
- Explicit no-synthesis policy.
- Repository-native correction instructions.
- Required source and date fields.
- Clear distinction between provider-authored material and curator notes.

## UX And Visual System

### Design Direction

- Research-tool density inspired by L2Beat, Walletbeat, and DeFiScan.
- Neutral white and cool-gray surfaces with restrained semantic status colors.
- Typography and spacing optimized for scanning rather than marketing presentation.
- Cards are limited to repeated mobile records and genuinely framed data groups.
- Status always uses text plus color/icon treatment, never color alone.

### Responsive Behavior

- Desktop prioritizes comparison density and sticky table context.
- Mobile converts the search registry into stable cards with a persistent bottom navigation.
- The matrix retains horizontal scrolling because collapsing feed columns would hide required comparison data.
- Touch targets are at least 44 pixels where practical.
- Long protocol and provider text wraps without resizing controls or shifting table geometry.

### States

- Initial render: canonical data is present before hydration; no loading flash.
- Empty search: actionable filter-reset state.
- External API failure: `Unavailable`, never zero.
- Not covered: explicit neutral state.
- Partial: visually distinct from both covered and not covered.
- Stale provenance: supported by the data model and displayed with capture dates.

## Delivery Sequence

### Phase 1: Foundation

- Scaffold Nuxt, TypeScript, Tailwind, linting, tests, and aliases.
- Define schemas and canonical YAML structure.
- Add deterministic validation and no-scoring policy checks.

### Phase 2: Data And Snapshot Generation

- Seed protocols, feeds, governance, audits, incidents, and sourced coverage.
- Generate the complete matrix.
- Generate the complete static release snapshot and DefiLlama metrics.

### Phase 3: Core UX

- Build the search-first registry.
- Build the full comparison matrix and evidence panel.
- Build protocol and feed detail routes.
- Add responsive navigation and mobile layouts.

### Phase 4: Trust And Governance

- Publish methodology and corrections workflows.
- Add AGPL-3.0-or-later license, contribution policy, project charter, and stewardship record.
- Label curator summaries and provider text unambiguously.

### Phase 5: Verification

- Validate exact record and matrix counts.
- Run static no-scoring checks.
- Run TypeScript, ESLint, unit tests, and production build.
- Run Playwright smoke tests on desktop and mobile.
- Capture and inspect search, matrix, and protocol-profile screenshots at both viewport classes.

## Verification Gates

The implementation is releasable only when all of these pass:

```bash
pnpm run validate:data
pnpm run check:no-scoring
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
pnpm run test:e2e
```

Expected data invariant:

```text
20 protocols x 16 feeds = 320 coverage cells
```

## Requirements Traceability

| Requirement | Implementation | Verification |
| --- | --- | --- |
| 20 protocols | `data/protocols/seed.yaml` | Data validator |
| 16 feeds | `data/feeds/seed.yaml` | Data validator |
| Complete matrix | Generated by `scripts/generate-static-data.ts` | 320-cell invariant and E2E |
| Coverage statuses | Shared Zod schema and status components | Unit and E2E tests |
| Governance provenance | `data/governance/seed.yaml` and protocol profiles | Schema validation |
| TVL/volume | DefiLlama build adapter and embedded snapshot | All 20 metrics populated and dated |
| No composite scoring | Charter plus static guard | `check:no-scoring` |
| Community corrections | Contribute route and `CONTRIBUTING.md` | E2E methodology check |
| Open source license | Full AGPL-3.0-or-later text | License file inspection |
| Long-term steward | PWN DAO Foundation named in `STEWARDSHIP.md` | Formal M2 confirmation pending |
| Public repository | Repository-ready project and docs | Pending owner publication |

## Launch Decisions Still Required

1. Obtain final written acceptance from PWN DAO Foundation and record the steward contact route, commitment date, and maintenance term.
2. Choose the owning GitHub organization and publish the repository at engagement start.
3. Choose the production hostname.
4. Approve a recurring review cadence for source freshness and provider changes.

These decisions are deliberately not invented in code because they establish public accountability and operational ownership.
