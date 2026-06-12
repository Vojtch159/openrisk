# Contributing

OpenRisk accepts data corrections through issues and pull requests.

## Data Corrections

Use the correction template in the app or include:

- protocol id
- feed id
- current value
- proposed value
- dated source URL
- whether the status is `covered`, `partial`, or `not_covered`

Provider-authored text should remain attributed and unedited. Curator notes must be labeled as such and must not become an OpenRisk-authored rating.

## Validation

Run:

```bash
pnpm run validate:data
pnpm run check:no-scoring
pnpm run test
```
