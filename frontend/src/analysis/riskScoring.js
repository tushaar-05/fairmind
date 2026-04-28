import { SCORE_WEIGHTS, THRESHOLDS } from './constants'

export function computeScore({ maxGap, positiveRate }) {
  return Math.max(
    0,
    Math.round(
      100
      - maxGap * SCORE_WEIGHTS.maxGapPenalty
      - Math.max(0, SCORE_WEIGHTS.targetPositiveRate - positiveRate) * SCORE_WEIGHTS.lowBaseRatePenalty,
    ),
  )
}

export function computeBiasFlags(groupStats, positiveRate) {
  const eligibleGroups = groupStats.filter((group) => group.count >= THRESHOLDS.lowSampleWarning)
  const groupsToCheck = eligibleGroups.length ? eligibleGroups : groupStats
  return groupsToCheck.filter((group) => Math.abs(group.approvalRate - positiveRate) >= THRESHOLDS.biasFlagGap).length
}

export function complianceRiskFromScore({ score, biasFlags }) {
  if (score < 60 || biasFlags >= 5) return 'High'
  if (score < 78 || biasFlags >= 2) return 'Moderate'
  return 'Low'
}
