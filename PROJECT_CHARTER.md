# OpenRisk Project Charter

OpenRisk is an aggregation layer, not a scoring layer.

## Non-Negotiable Constraint

OpenRisk must not create, infer, normalize, average, rank, or synthesize protocol risk scores. The app may display provider-authored ratings, grades, labels, dashboards, and research text only when they are attributed to the provider and shown with provenance.

## Change Process

Adding OpenRisk-created composite scoring requires written Ethereum Foundation agreement before implementation. Until that agreement exists, code review and CI must reject:

- `score`, `rank`, `composite`, or normalized risk fields in canonical data
- UI copy that suggests OpenRisk generated a rating
- visual ordering that implies a best-to-worst OpenRisk risk rank

## Stewardship

The v1 repository is designed for a named steward to maintain data quality through public issues, pull requests, validation scripts, and provider relationship updates.
