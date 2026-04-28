const POSITIVE_OUTCOME_PATTERN = /^(1|true|yes|y|approved|approve|accepted|pass|positive|granted)$/i

export function isPositiveOutcome(value) {
  return POSITIVE_OUTCOME_PATTERN.test(String(value ?? '').trim())
}

export function inferColumnType(column) {
  const normalized = String(column || '').toLowerCase()
  if (normalized === 'id' || normalized.endsWith('_id') || normalized.includes('applicant id')) return 'ID Column (exclude)'
  if (['decision', 'outcome', 'target', 'approved', 'approval', 'loan_status', 'personal loan'].some((key) => normalized.includes(key))) {
    return 'Target Variable (outcome)'
  }
  if (['gender', 'race', 'ethnicity', 'age', 'sex', 'disability', 'religion'].some((key) => normalized.includes(key))) {
    return 'Sensitive Attribute (e.g. race, gender)'
  }
  return 'Feature'
}

function normalizeGroupValue(column, rawValue) {
  const value = String(rawValue || 'Unknown').trim()
  const normalizedColumn = String(column || '').toLowerCase()
  if (normalizedColumn.includes('age')) {
    const numeric = Number(value.replace(/[^\d.-]/g, ''))
    if (Number.isFinite(numeric)) {
      if (numeric < 25) return '18-24'
      if (numeric < 35) return '25-34'
      if (numeric < 45) return '35-44'
      if (numeric < 55) return '45-54'
      return '55+'
    }
  }
  return value || 'Unknown'
}

export function buildDatasetProfile({ columns, rows, columnTypes }) {
  const targetColumn = columns.find((column) => columnTypes[column] === 'Target Variable (outcome)') || columns[columns.length - 1]
  const targetIndex = columns.indexOf(targetColumn)
  const sensitiveColumns = columns.filter((column) => columnTypes[column]?.startsWith('Sensitive'))
  const featureColumns = columns.filter((column) => columnTypes[column] === 'Feature')
  const totalRows = rows.length
  const positiveRows = rows.filter((row) => isPositiveOutcome(row[targetIndex]))
  const positiveRate = totalRows ? positiveRows.length / totalRows : 0

  const groupStats = sensitiveColumns.flatMap((column) => {
    const index = columns.indexOf(column)
    const groups = new Map()
    rows.forEach((row) => {
      const group = normalizeGroupValue(column, row[index])
      const current = groups.get(group) || { column, group, count: 0, positives: 0 }
      current.count += 1
      if (isPositiveOutcome(row[targetIndex])) current.positives += 1
      groups.set(group, current)
    })
    return [...groups.values()].map((item) => ({
      ...item,
      share: totalRows ? item.count / totalRows : 0,
      approvalRate: item.count ? item.positives / item.count : 0,
    }))
  })

  const groupA = groupStats[0]
  const groupB = groupStats.find((item) => item.column === groupA?.column && item.group !== groupA.group) || groupStats[1] || groupA

  return {
    targetColumn,
    targetIndex,
    sensitiveColumns,
    featureColumns,
    totalRows,
    positiveRate,
    groupStats,
    groupA,
    groupB,
  }
}
