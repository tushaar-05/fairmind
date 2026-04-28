# FairMind Methodology

## Overview

FairMind computes fairness indicators from observed outcomes in uploaded tabular datasets.
This is an auditing heuristic for fast triage, not a legal or statistical final judgment.

## Core Inputs

- Target outcome column
- One or more sensitive attribute columns
- Optional region selection (`EU`, `USA`, `Both`)

## Metric Formulas

- Demographic Parity: `1 - |group_approval_rate - global_positive_rate|`
- Equal Opportunity (proxy): subgroup positive rates when qualification labels are unavailable
- Disparate Impact: `min(groupA_rate, groupB_rate) / max(groupA_rate, groupB_rate)`
- Calibration (prototype): score-derived proxy for consistency tracking

## Status Thresholds

- Gap-based metrics:
  - `Fail`: gap >= 20 percentage points
  - `Borderline`: gap >= 10 percentage points
  - `Pass`: otherwise
- Disparate Impact:
  - `Fail`: ratio < 0.80
  - `Borderline`: ratio < 0.90
  - `Pass`: otherwise

## Fairness Score

`score = max(0, round(100 - maxGap*125 - max(0, 0.8-positiveRate)*8))`

This compresses major subgroup gap and low base-rate penalties into a single 0-100 signal.

## Confidence Guards

Subgroups with fewer than 25 rows are flagged as low-confidence samples.
These warnings are shown in the analysis UI to discourage over-interpretation.
