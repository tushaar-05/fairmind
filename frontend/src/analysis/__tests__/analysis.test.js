import { describe, expect, it } from 'vitest'
import { buildAuditResult } from '../auditEngine'
import { parseCsv, validateAuditInputs } from '../ingestion'

describe('parseCsv', () => {
  it('handles quoted commas and escaped quotes', () => {
    const csv = 'name,city,notes\n"Ana","New York, NY","She said ""hi"""'
    const parsed = parseCsv(csv)

    expect(parsed).toEqual([
      ['name', 'city', 'notes'],
      ['Ana', 'New York, NY', 'She said "hi"'],
    ])
  })
})

describe('validateAuditInputs', () => {
  it('returns validation errors for missing target and sensitive columns', () => {
    const result = validateAuditInputs({
      columns: ['id', 'feature'],
      rows: [['1', 'x']],
      columnTypes: { id: 'ID Column (exclude)', feature: 'Feature' },
    })

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })
})

describe('buildAuditResult', () => {
  it('returns deterministic score and metric shape', () => {
    const audit = buildAuditResult({
      file: { name: 'fixture.csv' },
      columns: ['Gender', 'Outcome', 'ZIP Code'],
      rows: [
        ['F', 'Approved', '94103'],
        ['F', 'Denied', '94103'],
        ['M', 'Denied', '10027'],
        ['M', 'Denied', '10027'],
      ],
      columnTypes: {
        Gender: 'Sensitive Attribute (e.g. race, gender)',
        Outcome: 'Target Variable (outcome)',
        'ZIP Code': 'Feature',
      },
      selectedRegion: 'Both',
    })

    expect(audit.score).toBeGreaterThanOrEqual(0)
    expect(audit.metrics.length).toBe(4)
    expect(audit.metricDetails[0]).toHaveProperty('formula')
    expect(audit).toHaveProperty('subgroupWarnings')
    expect(audit.complianceRows.length).toBeGreaterThan(0)
  })
})
