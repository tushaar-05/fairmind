import { THRESHOLDS } from './constants'

function statusFromGapPercent(gapPercent) {
  if (gapPercent >= 20) return 'Fail'
  if (gapPercent >= 10) return 'Borderline'
  return 'Pass'
}

export function buildFairnessMetrics({ groupA, groupB, positiveRate, maxGap }) {
  const groupAGap = groupA ? Math.abs(groupA.approvalRate - positiveRate) : 0
  const groupBGap = groupB ? Math.abs(groupB.approvalRate - positiveRate) : 0
  const disparateImpact = groupA && groupB
    ? Math.min(groupA.approvalRate, groupB.approvalRate) / Math.max(groupA.approvalRate || 0.01, groupB.approvalRate || 0.01)
    : 1

  const demographicStatus = statusFromGapPercent(maxGap * 100)
  const equalOppStatus = statusFromGapPercent(maxGap * 80)
  const disparateStatus = disparateImpact < THRESHOLDS.disparateImpactFail
    ? 'Fail'
    : disparateImpact < THRESHOLDS.disparateImpactBorderline
      ? 'Borderline'
      : 'Pass'

  const metrics = [
    {
      id: 'demographic_parity',
      name: 'Demographic Parity',
      groupAScore: (1 - groupAGap).toFixed(2),
      groupBScore: (1 - groupBGap).toFixed(2),
      status: demographicStatus,
      tip: 'Checks whether positive outcomes are distributed similarly across groups.',
      formula: '1 - |group_approval_rate - global_positive_rate|',
      threshold: 'Fail >= 20pp gap, Borderline >= 10pp gap',
      reason: `Largest subgroup approval gap is ${(maxGap * 100).toFixed(1)} percentage points.`,
      details: {
        groupANumerator: `${groupA?.positives ?? 0}/${groupA?.count ?? 0}`,
        groupBNumerator: `${groupB?.positives ?? 0}/${groupB?.count ?? 0}`,
      },
    },
    {
      id: 'equal_opportunity',
      name: 'Equal Opportunity',
      groupAScore: (groupA?.approvalRate || positiveRate).toFixed(2),
      groupBScore: (groupB?.approvalRate || positiveRate).toFixed(2),
      status: equalOppStatus,
      tip: 'Compares true positive rate proxies between groups when only outcomes are available.',
      formula: 'group_positive_rate (proxy when no qualification label is provided)',
      threshold: 'Fail >= 16pp proxy gap, Borderline >= 8pp proxy gap',
      reason: `Proxy equal-opportunity gap is ${(maxGap * 80).toFixed(1)} scaled points.`,
      details: {
        groupANumerator: `${groupA?.positives ?? 0}/${groupA?.count ?? 0}`,
        groupBNumerator: `${groupB?.positives ?? 0}/${groupB?.count ?? 0}`,
      },
    },
    {
      id: 'disparate_impact',
      name: 'Disparate Impact',
      groupAScore: disparateImpact.toFixed(2),
      groupBScore: '1.00',
      status: disparateStatus,
      tip: 'Flags outcome ratios below common four-fifths guidance.',
      formula: 'min(groupA_rate, groupB_rate) / max(groupA_rate, groupB_rate)',
      threshold: 'Fail < 0.80, Borderline < 0.90',
      reason: `Observed ratio is ${disparateImpact.toFixed(2)}.`,
      details: {
        groupANumerator: (groupA?.approvalRate ?? positiveRate).toFixed(2),
        groupBNumerator: (groupB?.approvalRate ?? positiveRate).toFixed(2),
      },
    },
  ]

  return { metrics, disparateImpact }
}

export function buildSubgroupWarnings(groupStats) {
  return groupStats
    .filter((group) => group.count < THRESHOLDS.lowSampleWarning)
    .slice(0, 4)
    .map((group) => `${group.column}: ${group.group} has low sample size (${group.count} rows).`)
}
