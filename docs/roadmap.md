# Roadmap

## Phase 1 (Completed in this revamp)

- Extracted fairness computation into reusable frontend analysis modules
- Added robust CSV parsing for quoted cells and escaped quotes
- Added setup validation and subgroup warning guardrails
- Added metric explainability details in UI
- Added backend API scaffold with analysis contract

## Phase 2 (Next)

- Move analysis execution from frontend to backend API
- Replace prototype calibration and counterfactual proxies with model-backed computations
- Add report export action wiring and artifact persistence
- Integrate live monitoring streams instead of static demo arrays

## Phase 3 (Production Readiness)

- Add authentication/authorization and tenant isolation
- Add observability (traces, metrics, structured logs)
- Add policy versioning for compliance rules
- Add regression benchmark suite for fairness drift across releases
