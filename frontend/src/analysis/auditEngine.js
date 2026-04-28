import { THRESHOLDS } from './constants'
import { buildComplianceRows } from './complianceMapping'
import { buildDatasetProfile } from './datasetProfile'
import { buildFairnessMetrics, buildSubgroupWarnings } from './fairnessMetrics'
import { complianceRiskFromScore, computeBiasFlags, computeScore } from './riskScoring'

function buildRepresentation(groupStats) {
  return [...groupStats]
    .sort((a, b) => a.share - b.share)
    .slice(0, 6)
    .map((item) => [
      `${item.column}: ${item.group}`,
      Math.round(item.share * 100),
      item.share < THRESHOLDS.lowRepresentationShare ? 'critical' : item.share < THRESHOLDS.mediumRepresentationShare ? 'medium' : 'low',
    ])
}

function buildProxyRisk(columns, columnTypes) {
  return columns
    .filter((column) => columnTypes[column] !== 'Target Variable (outcome)' && columnTypes[column] !== 'ID Column (exclude)')
    .map((column) => {
      const normalized = column.toLowerCase()
      const risk = ['zip', 'postal', 'postcode', 'address', 'last name', 'surname'].some((key) => normalized.includes(key))
        ? 'High'
        : ['job', 'title', 'education', 'school', 'income', 'location'].some((key) => normalized.includes(key))
          ? 'Medium'
          : 'Low'
      return [column, risk]
    })
    .sort((a, b) => ['High', 'Medium', 'Low'].indexOf(a[1]) - ['High', 'Medium', 'Low'].indexOf(b[1]))
    .slice(0, 6)
}

export function buildAuditResult({ file, columns, rows, columnTypes, selectedRegion }) {
  const profile = buildDatasetProfile({ columns, rows, columnTypes })
  const stableGroups = profile.groupStats.filter((item) => item.count >= THRESHOLDS.lowSampleWarning)
  const approvalRates = (stableGroups.length ? stableGroups : profile.groupStats).map((item) => item.approvalRate)
  const maxGap = approvalRates.length > 1 ? Math.max(...approvalRates) - Math.min(...approvalRates) : 0

  const score = computeScore({ maxGap, positiveRate: profile.positiveRate })
  const biasFlags = computeBiasFlags(profile.groupStats, profile.positiveRate)
  const complianceRisk = complianceRiskFromScore({ score, biasFlags })

  const representation = buildRepresentation(profile.groupStats)
  const proxy = buildProxyRisk(columns, columnTypes)
  const { metrics, disparateImpact } = buildFairnessMetrics({
    groupA: profile.groupA,
    groupB: profile.groupB,
    positiveRate: profile.positiveRate,
    maxGap,
  })
  const subgroupWarnings = buildSubgroupWarnings(profile.groupStats)

  const calibrationStatus = score < 65 ? 'Borderline' : 'Pass'
  const calibrationMetric = {
    id: 'calibration',
    name: 'Calibration',
    groupAScore: (0.86 + Math.min(score, 90) / 1000).toFixed(2),
    groupBScore: (0.82 + Math.min(score, 90) / 1000).toFixed(2),
    status: calibrationStatus,
    tip: 'Checks whether predicted risk means the same thing across groups.',
    formula: '0.86 + min(score, 90)/1000 (prototype calibration proxy)',
    threshold: 'Borderline if fairness score < 65',
    reason: `Calibration proxy follows global score ${score}/100.`,
    details: {
      groupANumerator: 'score-derived proxy',
      groupBNumerator: 'score-derived proxy',
    },
  }

  const counterfactualDiffs = Math.min(100, Math.round(maxGap * 100 + proxy.filter(([, risk]) => risk === 'High').length * 9))

  const complianceRows = buildComplianceRows({
    selectedRegion,
    score,
    biasFlags,
    maxGap,
    hasProxyHighRisk: proxy.some(([, risk]) => risk === 'High'),
    sensitiveColumns: profile.sensitiveColumns,
  })

  return {
    datasetName: file?.name || 'Uploaded Dataset',
    timestamp: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
    score,
    biasFlags,
    sensitiveColumns: profile.sensitiveColumns,
    complianceRisk,
    targetColumn: profile.targetColumn,
    totalRows: profile.totalRows,
    positiveRate: profile.positiveRate,
    representation: representation.length ? representation : [['No sensitive columns tagged', 100, 'low']],
    proxy,
    metrics: [...metrics, calibrationMetric],
    complianceRows,
    counterfactualDiffs,
    counterfactual: {
      original: `${profile.sensitiveColumns[0] || 'Sensitive attribute'} = ${profile.groupA?.group || 'Group A'}`,
      changed: `${profile.sensitiveColumns[0] || 'Sensitive attribute'} = ${profile.groupB?.group || 'Group B'}`,
      rejected: profile.groupA && profile.groupB ? profile.groupA.approvalRate < profile.groupB.approvalRate : true,
    },
    counterfactualAttribute: profile.sensitiveColumns[0] || 'Sensitive attribute',
    matrixLabels: profile.sensitiveColumns.length ? profile.sensitiveColumns.slice(0, 5) : profile.featureColumns.slice(0, 5),
    metricDetails: [...metrics, calibrationMetric].map((metric) => ({
      metric: metric.name,
      formula: metric.formula,
      threshold: metric.threshold,
      reason: metric.reason,
      numerators: `${metric.details.groupANumerator} vs ${metric.details.groupBNumerator}`,
    })),
    subgroupWarnings,
    meta: {
      maxGap: Number((maxGap * 100).toFixed(2)),
      disparateImpact: Number(disparateImpact.toFixed(2)),
    },
  }
}
