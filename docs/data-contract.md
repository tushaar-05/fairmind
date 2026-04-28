# Data Contract

## Supported Formats

- `.csv`
- `.json` (array of objects or single object)

## Required Modeling Semantics

- One column tagged as `Target Variable (outcome)`
- At least one column tagged as `Sensitive Attribute`

## Column Type Semantics

- `Sensitive Attribute (e.g. race, gender)`
- `Target Variable (outcome)`
- `Feature`
- `ID Column (exclude)`

## Outcome Coercion

The following target values are treated as positive outcomes:
`1, true, yes, y, approved, approve, accepted, pass, positive, granted`

Anything else is treated as non-positive.

## Minimum Data Expectations

- Non-empty header and rows
- Stable fairness interpretation improves with larger subgroup samples
- Rows with missing sensitive-group values are mapped to `Unknown`
