export const COLUMN_TYPE_OPTIONS = [
  'Sensitive Attribute (e.g. race, gender)',
  'Target Variable (outcome)',
  'Feature',
  'ID Column (exclude)',
]

export const SCORE_WEIGHTS = {
  maxGapPenalty: 125,
  lowBaseRatePenalty: 8,
  targetPositiveRate: 0.8,
}

export const THRESHOLDS = {
  biasFlagGap: 0.15,
  lowRepresentationShare: 0.08,
  mediumRepresentationShare: 0.16,
  disparateImpactFail: 0.8,
  disparateImpactBorderline: 0.9,
  lowSampleWarning: 25,
}
