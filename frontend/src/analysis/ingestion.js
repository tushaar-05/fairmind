import { inferColumnType } from './datasetProfile'

export function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  const source = String(text ?? '')
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i]
    const next = source[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (!inQuotes && char === ',') {
      row.push(cell.trim())
      cell = ''
      continue
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') i += 1
      row.push(cell.trim())
      cell = ''
      if (row.some((entry) => entry !== '')) rows.push(row)
      row = []
      continue
    }

    cell += char
  }

  if (cell.length || row.length) {
    row.push(cell.trim())
    if (row.some((entry) => entry !== '')) rows.push(row)
  }

  return rows
}

export function parseJsonRecords(text) {
  const parsed = JSON.parse(String(text || '[]'))
  const records = Array.isArray(parsed) ? parsed : [parsed]
  const columns = Object.keys(records[0] || {})
  const rows = records.map((record) => columns.map((column) => String(record[column] ?? '')))
  return { columns, rows }
}

export async function parseDatasetFile(file) {
  const fileName = file.name.toLowerCase()
  const raw = await file.text()

  if (fileName.endsWith('.csv')) {
    const parsed = parseCsv(raw)
    return {
      columns: parsed[0] || [],
      rows: parsed.slice(1),
      columnTypes: Object.fromEntries((parsed[0] || []).map((column) => [column, inferColumnType(column)])),
    }
  }

  if (fileName.endsWith('.json')) {
    const { columns, rows } = parseJsonRecords(raw)
    return {
      columns,
      rows,
      columnTypes: Object.fromEntries(columns.map((column) => [column, inferColumnType(column)])),
    }
  }

  throw new Error('Unsupported file type. Use CSV or JSON.')
}

export function validateAuditInputs({ columns, rows, columnTypes }) {
  const errors = []
  const targetColumn = columns.find((column) => columnTypes[column] === 'Target Variable (outcome)')
  const sensitiveColumns = columns.filter((column) => String(columnTypes[column] || '').startsWith('Sensitive'))

  if (!columns.length || !rows.length) {
    errors.push('Dataset appears empty. Upload at least one row and one column.')
  }
  if (!targetColumn) {
    errors.push('Select one target outcome column before running analysis.')
  }
  if (!sensitiveColumns.length) {
    errors.push('Tag at least one sensitive attribute to compute fairness metrics.')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
