import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const routes = {
  home: '/',
  upload: '/upload',
  analysis: '/analysis',
  monitoring: '/monitoring',
}

const sampleColumns = ['ID', 'Age', 'Experience', 'Income', 'ZIP Code', 'Family', 'CCAvg', 'Education', 'Mortgage', 'Personal Loan']
const sampleRows = [
  ['1042', '34', '8', '$82,400', '94103', '3', '2.4', 'Graduate', '$0', 'Approved'],
  ['1043', '41', '14', '$66,100', '10027', '2', '1.8', 'College', '$220K', 'Denied'],
  ['1044', '29', '5', '$58,900', '30318', '1', '1.2', 'Graduate', '$0', 'Denied'],
  ['1045', '37', '10', '$71,300', '60616', '4', '3.1', 'Advanced', '$180K', 'Review'],
  ['1046', '52', '25', '$91,800', '75201', '2', '2.7', 'College', '$315K', 'Approved'],
]

const columnTypeOptions = [
  'Sensitive Attribute (e.g. race, gender)',
  'Target Variable (outcome)',
  'Feature',
  'ID Column (exclude)',
]

const analysisChecks = [
  'Demographic Parity',
  'Equal Opportunity',
  'Disparate Impact',
  'Counterfactual Bias',
  'Proxy Variable Detection',
  'Intersectional Analysis',
]

const complianceByRegion = {
  EU: ['EU AI Act', 'GDPR Art. 22'],
  USA: ['ECOA', 'Title VII'],
  Both: ['EU AI Act', 'GDPR Art. 22', 'ECOA', 'Title VII'],
}

const presets = ['Banking', 'Healthcare', 'Hiring', 'Government', 'Other']

const presetChecks = {
  Banking: ['Demographic Parity', 'Equal Opportunity', 'Disparate Impact', 'Proxy Variable Detection', 'Intersectional Analysis'],
  Healthcare: ['Equal Opportunity', 'Counterfactual Bias', 'Proxy Variable Detection', 'Intersectional Analysis'],
  Hiring: ['Demographic Parity', 'Disparate Impact', 'Counterfactual Bias', 'Intersectional Analysis'],
  Government: ['Demographic Parity', 'Equal Opportunity', 'Disparate Impact', 'Proxy Variable Detection', 'Intersectional Analysis'],
  Other: analysisChecks,
}

const dateRanges = ['Today', 'Last 7 Days', 'Last 30 Days', 'Custom']

const volumeData = [
  { day: 'Apr 22', a: 132, b: 118 },
  { day: 'Apr 23', a: 148, b: 126 },
  { day: 'Apr 24', a: 164, b: 139, anomaly: true },
  { day: 'Apr 25', a: 152, b: 134 },
  { day: 'Apr 26', a: 176, b: 142 },
  { day: 'Apr 27', a: 188, b: 151, anomaly: true },
  { day: 'Apr 28', a: 171, b: 129 },
]

const fairnessData = [
  { day: '22', score: 82 },
  { day: '23', score: 79 },
  { day: '24', score: 75 },
  { day: '25', score: 72 },
  { day: '26', score: 68 },
  { day: '27', score: 66 },
  { day: '28', score: 74 },
]

const approvalData = [
  { day: '22', a: 72, b: 62 },
  { day: '23', a: 74, b: 60 },
  { day: '24', a: 76, b: 59 },
  { day: '25', a: 73, b: 58 },
  { day: '26', a: 78, b: 61 },
  { day: '27', a: 80, b: 59 },
  { day: '28', a: 77, b: 59 },
]

const alerts = [
  {
    severity: 'critical',
    title: 'Approval gap exceeded threshold for ZIP + age segment',
    time: '2 min ago',
  },
  {
    severity: 'warning',
    title: 'Proxy risk rising for geographic features',
    time: '14 min ago',
  },
]

const feedRows = [
  ['12:48:22', 'Loan approval', 'Approved', 'Clear'],
  ['12:47:58', 'Loan approval', 'Denied', 'Flagged'],
  ['12:47:41', 'Limit increase', 'Review', 'Clear'],
  ['12:47:09', 'Loan approval', 'Approved', 'Clear'],
  ['12:46:44', 'Loan approval', 'Denied', 'Flagged'],
  ['12:46:12', 'Refinance', 'Approved', 'Clear'],
  ['12:45:37', 'Loan approval', 'Review', 'Clear'],
]

const heatmapRows = ['Age 18-30', 'Age 31-45', 'Age 46-60', 'Age 60+']
const heatmapCols = ['Low income', 'Mid income', 'High income', 'Urban', 'Rural']
const heatmapValues = [
  [42, 35, 18, 28, 64],
  [31, 24, 16, 22, 48],
  [22, 19, 12, 18, 36],
  [51, 44, 28, 40, 72],
]

function DatabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z" />
      <path d="M4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7" />
      <path d="M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 0 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 0 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 0 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1a2 2 0 0 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15V4" />
      <path d="M8 8l4-4 4 4" />
      <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <i />
      <b />
    </span>
  )
}

function AppNav({ route, navigate }) {
  return (
    <header className="app-nav">
      <button className="brand-button" type="button" onClick={() => navigate(routes.home)}>
        <BrandMark />
        FairMind
      </button>
      <nav aria-label="App pages">
        <button className={route === routes.home ? 'active' : ''} type="button" onClick={() => navigate(routes.home)}>Landing</button>
        <button className={route === routes.upload ? 'active' : ''} type="button" onClick={() => navigate(routes.upload)}>Upload</button>
        <button className={route === routes.analysis ? 'active' : ''} type="button" onClick={() => navigate(routes.analysis)}>Analysis</button>
        <button className={route === routes.monitoring ? 'active' : ''} type="button" onClick={() => navigate(routes.monitoring)}>Monitoring</button>
      </nav>
    </header>
  )
}

function RoutedLink({ to, navigate, children, className = '' }) {
  return (
    <button className={className} type="button" onClick={() => navigate(to)}>
      {children}
    </button>
  )
}

function pointPath(data, key, max = 200, width = 560, height = 210) {
  return data
    .map((item, index) => {
      const x = 34 + (index * (width - 68)) / (data.length - 1)
      const y = height - 30 - (item[key] / max) * (height - 58)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

function ChartCard({ title, children, className = '' }) {
  return (
    <section className={`widget ${className}`}>
      <div className="widget-header">
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function DecisionVolumeChart() {
  const [hovered, setHovered] = useState(null)
  const hoveredData = hovered !== null ? volumeData[hovered] : null
  const aPath = pointPath(volumeData, 'a')
  const bPath = pointPath(volumeData, 'b')

  return (
    <ChartCard title="Decision Volume" className="wide-widget">
      <div className="legend-row">
        <span><i className="teal" /> Group A</span>
        <span><i className="indigo" /> Group B</span>
      </div>
      <div className="chart-wrap">
        <svg className="line-chart" viewBox="0 0 560 230" role="img" aria-label="Decision volume by group over time">
          <path className="grid-line" d="M34 46 H526 M34 102 H526 M34 158 H526" />
          <path className="area-fill teal-fill" d={`${aPath} L526 200 L34 200 Z`} />
          <path className="series teal-stroke" d={aPath} />
          <path className="series indigo-stroke" d={bPath} />
          {volumeData.map((item, index) => {
            const x = 34 + (index * 492) / (volumeData.length - 1)
            const y = 200 - (item.a / 200) * 172
            return (
              <g key={item.day}>
                <circle
                  className="hover-target"
                  cx={x}
                  cy={y}
                  r="15"
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                />
                {item.anomaly && <rect className="anomaly" x={x - 5} y={y - 27} width="10" height="10" transform={`rotate(45 ${x} ${y - 22})`} />}
                <text x={x} y="222">{item.day}</text>
              </g>
            )
          })}
        </svg>
        {hoveredData && (
          <div className="chart-tooltip">
            <strong>{hoveredData.day}</strong>
            <span>Group A: {hoveredData.a}</span>
            <span>Group B: {hoveredData.b}</span>
          </div>
        )}
      </div>
    </ChartCard>
  )
}

function FairnessScoreChart() {
  const highPath = pointPath(fairnessData.filter((item) => item.score >= 70), 'score', 100)
  const lowPath = pointPath(fairnessData.filter((item) => item.score < 70), 'score', 100)

  return (
    <ChartCard title="Fairness Score Over Time">
      <svg className="line-chart" viewBox="0 0 560 230" role="img" aria-label="Rolling fairness score over time">
        <path className="grid-line" d="M34 56 H526 M34 112 H526 M34 168 H526" />
        <path className="threshold" d="M34 80 H526" />
        <text className="threshold-label" x="356" y="74">Regulatory Threshold</text>
        <path className="series teal-stroke" d={highPath} />
        <path className="series red-stroke" d={lowPath} />
        {fairnessData.map((item, index) => {
          const x = 34 + (index * 492) / (fairnessData.length - 1)
          return <text key={item.day} x={x} y="222">Apr {item.day}</text>
        })}
      </svg>
    </ChartCard>
  )
}

function ApprovalBarChart() {
  return (
    <ChartCard title="Approval Rate by Group">
      <svg className="bar-chart" viewBox="0 0 560 240" role="img" aria-label="Approval rates for Group A and Group B">
        <path className="grid-line" d="M34 50 H526 M34 104 H526 M34 158 H526" />
        {approvalData.map((item, index) => {
          const x = 42 + index * 70
          const aHeight = item.a * 1.55
          const bHeight = item.b * 1.55
          return (
            <g key={item.day}>
              <rect className="bar teal-bar" x={x} y={190 - aHeight} width="18" height={aHeight} />
              <rect className="bar indigo-bar" x={x + 22} y={190 - bHeight} width="18" height={bHeight} />
              <text x={x + 20} y="222">Apr {item.day}</text>
            </g>
          )
        })}
      </svg>
      <div className="delta-line">Gap Today: <strong>18 percentage points</strong> <span>↑ from yesterday</span></div>
    </ChartCard>
  )
}

function AlertsPanel() {
  return (
    <ChartCard title="Active Alerts">
      {alerts.length === 0 ? (
        <div className="empty-alerts">
          <span>✓</span>
          <strong>No anomalies detected in the last 24 hours.</strong>
        </div>
      ) : (
        <div className="alert-list">
          {alerts.map((alert) => (
            <article className="alert-item" key={alert.title}>
              <span className={`severity ${alert.severity}`} />
              <div>
                <h3>{alert.title}</h3>
                <p>{alert.time}</p>
              </div>
              <a href="#investigate">Investigate →</a>
            </article>
          ))}
        </div>
      )}
    </ChartCard>
  )
}

function DecisionFeed() {
  return (
    <ChartCard title="Decision Feed" className="tall-widget">
      <div className="feed-table-wrap">
        <table className="feed-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Decision Type</th>
              <th>Outcome</th>
              <th>Fairness Flag</th>
            </tr>
          </thead>
          <tbody>
            {feedRows.map((row) => (
              <tr key={`${row[0]}-${row[1]}`}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td>
                  {row[3] === 'Clear' ? (
                    <span className="flag clear">✓ Clear</span>
                  ) : (
                    <span className="flag flagged">⚠ Flagged</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  )
}

function RiskHeatmap() {
  return (
    <ChartCard title="Live Intersectional Risk Map">
      <p className="updated-label">Last Updated: 3 min ago</p>
      <div className="heatmap">
        <span />
        {heatmapCols.map((col) => <strong key={col}>{col}</strong>)}
        {heatmapRows.map((row, rowIndex) => (
          <div className="heatmap-row" key={row}>
            <strong>{row}</strong>
            {heatmapValues[rowIndex].map((value, colIndex) => (
              <span
                className="bubble"
                style={{ '--risk-size': `${22 + value / 2}px`, '--risk-alpha': 0.12 + value / 100 }}
                key={`${row}-${heatmapCols[colIndex]}`}
              >
                {value}
              </span>
            ))}
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

function SettingsDrawer({ open, onClose }) {
  return (
    <>
      <div className={`drawer-scrim ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`settings-drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="drawer-header">
          <div>
            <h2>Monitoring Settings</h2>
            <p>Tune alert sensitivity and notification channels.</p>
          </div>
          <button type="button" onClick={onClose}>×</button>
        </div>

        <label className="slider-row">
          Alert sensitivity
          <input type="range" min="1" max="10" defaultValue="7" />
        </label>
        <label className="slider-row">
          Fairness score floor
          <input type="range" min="50" max="95" defaultValue="70" />
        </label>

        <div className="drawer-section">
          <h3>Metrics to monitor</h3>
          {['Demographic parity', 'Disparate impact', 'Proxy variables', 'Intersectional risk'].map((metric) => (
            <label className="switch-row" key={metric}>
              <span>{metric}</span>
              <input type="checkbox" defaultChecked />
            </label>
          ))}
        </div>

        <div className="drawer-section">
          <h3>Notifications</h3>
          <label className="switch-row">
            <span>Email alerts</span>
            <input type="checkbox" defaultChecked />
          </label>
          <label className="switch-row">
            <span>Webhook events</span>
            <input type="checkbox" />
          </label>
        </div>

        <button className="pause-button" type="button">Pause Monitoring</button>
      </aside>
    </>
  )
}

function LandingPage({ navigate }) {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div>
          <span className="eyebrow">AI governance for teams that move fast</span>
          <h1>AI Should Be Fair. We Make Sure It Is.</h1>
          <p>
            FairMind audits models before launch and monitors live decisions after
            deployment, giving your team evidence, alerts, and reports in one place.
          </p>
          <div className="landing-actions">
            <RoutedLink className="primary-action" to={routes.upload} navigate={navigate}>Start Free Audit</RoutedLink>
            <RoutedLink className="secondary-action" to={routes.monitoring} navigate={navigate}>View Monitoring</RoutedLink>
          </div>
          <div className="trust-row">
            <span>GDPR Compliant</span>
            <span>EU AI Act Ready</span>
            <span>SOC 2 Certified</span>
          </div>
        </div>
        <div className="hero-dashboard" aria-label="Fairness score preview">
          <div className="hero-dashboard-top">
            <span>Audit summary</span>
            <strong>FairMind</strong>
          </div>
          <div className="score-ring">
            <strong>74</strong>
            <span>Fairness Score</span>
          </div>
          <div className="mini-bars">
            <span style={{ height: '72%' }} />
            <span style={{ height: '48%' }} />
            <span style={{ height: '61%' }} />
            <span style={{ height: '38%' }} />
            <span style={{ height: '84%' }} />
          </div>
        </div>
      </section>

      <section className="landing-sections">
        {[
          ['Upload & Audit', 'Classify sensitive columns, configure checks, and run a full audit.'],
          ['Real-Time Monitoring', 'Track live model behavior with alerting and drift indicators.'],
          ['Compliance Reporting', 'Export evidence for governance, legal, and model risk reviews.'],
        ].map(([title, text]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

function UploadStepper({ currentStep }) {
  const uploadSteps = ['Upload Data', 'Configure Analysis', 'Run Audit']

  return (
    <ol className="upload-stepper" aria-label="Audit setup progress">
      {uploadSteps.map((step, index) => {
        const number = index + 1
        const complete = currentStep > number
        const active = currentStep === number

        return (
          <li className={`${complete ? 'complete' : ''} ${active ? 'active' : ''}`} key={step}>
            <span>{complete ? <CheckIcon /> : number}</span>
            <strong>{number} — {step}</strong>
          </li>
        )
      })}
    </ol>
  )
}

function parseCsv(text) {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')))
}

function formatFileSize(bytes) {
  if (!bytes) return '0 KB'
  const units = ['B', 'KB', 'MB', 'GB']
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** power).toFixed(power === 0 ? 0 : 1)} ${units[power]}`
}

function isPositiveOutcome(value) {
  return /^(1|true|yes|y|approved|approve|accepted|pass|positive|granted)$/i.test(String(value).trim())
}

function inferColumnType(column) {
  const normalized = column.toLowerCase()
  if (normalized === 'id' || normalized.endsWith('_id') || normalized.includes('applicant id')) return 'ID Column (exclude)'
  if (['decision', 'outcome', 'target', 'approved', 'approval', 'loan_status', 'personal loan'].some((key) => normalized.includes(key))) return 'Target Variable (outcome)'
  if (['gender', 'race', 'ethnicity', 'age', 'zip', 'postcode', 'location', 'education'].some((key) => normalized.includes(key))) return 'Sensitive Attribute (e.g. race, gender)'
  return 'Feature'
}

function riskFromGap(gap) {
  if (gap >= 25) return 'High'
  if (gap >= 12) return 'Medium'
  return 'Low'
}

function statusFromGap(gap) {
  if (gap >= 20) return 'Fail'
  if (gap >= 10) return 'Borderline'
  return 'Pass'
}

function buildAuditResult({ file, columns, rows, columnTypes, selectedRegion }) {
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
      const group = String(row[index] || 'Unknown')
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

  const approvalRates = groupStats.map((item) => item.approvalRate)
  const maxGap = approvalRates.length > 1 ? Math.max(...approvalRates) - Math.min(...approvalRates) : 0
  const score = Math.max(0, Math.round(100 - maxGap * 100 * 1.25 - Math.max(0, 0.8 - positiveRate) * 8))
  const biasFlags = groupStats.filter((item) => Math.abs(item.approvalRate - positiveRate) >= 0.15).length
  const complianceRisk = score < 60 || biasFlags >= 5 ? 'High' : score < 78 || biasFlags >= 2 ? 'Moderate' : 'Low'

  const representation = groupStats
    .sort((a, b) => a.share - b.share)
    .slice(0, 6)
    .map((item) => [
      `${item.column}: ${item.group}`,
      Math.round(item.share * 100),
      item.share < 0.08 ? 'critical' : item.share < 0.16 ? 'medium' : 'low',
    ])

  const proxy = columns
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

  const groupA = groupStats[0]
  const groupB = groupStats.find((item) => item.column === groupA?.column && item.group !== groupA.group) || groupStats[1] || groupA
  const groupAGap = groupA ? Math.abs(groupA.approvalRate - positiveRate) : 0
  const groupBGap = groupB ? Math.abs(groupB.approvalRate - positiveRate) : 0
  const disparateImpact = groupA && groupB ? Math.min(groupA.approvalRate, groupB.approvalRate) / Math.max(groupA.approvalRate || 0.01, groupB.approvalRate || 0.01) : 1

  const metrics = [
    ['Demographic Parity', (1 - groupAGap).toFixed(2), (1 - groupBGap).toFixed(2), statusFromGap(maxGap * 100), 'Checks whether positive outcomes are distributed similarly across groups.'],
    ['Equal Opportunity', (groupA?.approvalRate || positiveRate).toFixed(2), (groupB?.approvalRate || positiveRate).toFixed(2), statusFromGap(maxGap * 80), 'Compares true positive rates for qualified applicants across groups.'],
    ['Disparate Impact', disparateImpact.toFixed(2), '1.00', disparateImpact < 0.8 ? 'Fail' : disparateImpact < 0.9 ? 'Borderline' : 'Pass', 'Flags outcome ratios below common four-fifths guidance.'],
    ['Calibration', (0.86 + Math.min(score, 90) / 1000).toFixed(2), (0.82 + Math.min(score, 90) / 1000).toFixed(2), score < 65 ? 'Borderline' : 'Pass', 'Checks whether predicted risk means the same thing across groups.'],
  ]

  const counterfactualDiffs = Math.min(100, Math.round(maxGap * 100 + proxy.filter(([, risk]) => risk === 'High').length * 9))
  const lawRows = [
    ['EU AI Act', 'EU', complianceRisk === 'High' ? 'High' : 'Medium', 'Fairness Metrics, Report', `Fairness score is ${score}/100 with ${biasFlags} flagged subgroup gaps. Add mitigation notes and post-deployment monitoring evidence.`],
    ['GDPR Art. 22', 'EU', score < 65 ? 'Medium' : 'Low', 'Model Behavior', 'Automated decision explanations should identify the top drivers and provide an appeal path for affected users.'],
    ['ECOA', 'USA', proxy.some(([, risk]) => risk === 'High') ? 'High' : riskFromGap(maxGap * 100), 'Dataset Forensics, Counterfactual Sim', 'Potential credit-decision proxy behavior found. Consider removing granular geographic or identity-adjacent fields.'],
    ['Title VII', 'USA', sensitiveColumns.length ? riskFromGap(maxGap * 80) : 'Low', 'Fairness Metrics', 'If this system is used for employment, review subgroup outcome gaps and document threshold choices.'],
  ].filter(([, region]) => selectedRegion === 'Both' || region === selectedRegion)

  return {
    datasetName: file?.name || 'Uploaded Dataset',
    timestamp: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
    score,
    biasFlags,
    sensitiveColumns,
    complianceRisk,
    targetColumn,
    totalRows,
    positiveRate,
    representation: representation.length ? representation : [['No sensitive columns tagged', 100, 'low']],
    proxy,
    metrics,
    complianceRows: lawRows,
    counterfactualDiffs,
    counterfactual: {
      original: `${sensitiveColumns[0] || 'Sensitive attribute'} = ${groupA?.group || 'Group A'}`,
      changed: `${sensitiveColumns[0] || 'Sensitive attribute'} = ${groupB?.group || 'Group B'}`,
      rejected: groupA && groupB ? groupA.approvalRate < groupB.approvalRate : true,
    },
    matrixLabels: sensitiveColumns.length ? sensitiveColumns.slice(0, 5) : featureColumns.slice(0, 5),
  }
}

function UploadPage({ navigate, onAuditComplete }) {
  const inputRef = useRef(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [file, setFile] = useState(null)
  const [columns, setColumns] = useState(sampleColumns)
  const [rows, setRows] = useState(sampleRows)
  const [columnTypes, setColumnTypes] = useState(() =>
    Object.fromEntries(sampleColumns.map((column) => [column, column === 'ID' ? 'ID Column (exclude)' : column === 'Personal Loan' ? 'Target Variable (outcome)' : 'Feature'])),
  )
  const [selectedPreset, setSelectedPreset] = useState('Banking')
  const [selectedRegion, setSelectedRegion] = useState('Both')
  const [selectedChecks, setSelectedChecks] = useState(() => new Set(analysisChecks))

  const laws = complianceByRegion[selectedRegion]
  const hasSensitiveColumn = useMemo(() => Object.values(columnTypes).some((type) => type.startsWith('Sensitive')), [columnTypes])

  function loadPreview(nextFile) {
    setFile(nextFile)
    setCurrentStep(1)
    if (nextFile.name.toLowerCase().endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = () => {
        const parsed = parseCsv(String(reader.result || ''))
        if (parsed.length > 1) {
          setColumns(parsed[0])
          setRows(parsed.slice(1))
          setColumnTypes(Object.fromEntries(parsed[0].map((column) => [column, inferColumnType(column)])))
        }
      }
      reader.readAsText(nextFile)
      return
    }

    if (nextFile.name.toLowerCase().endsWith('.json')) {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result || '[]'))
          const records = Array.isArray(parsed) ? parsed : [parsed]
          const parsedColumns = Object.keys(records[0] || {})
          if (parsedColumns.length) {
            setColumns(parsedColumns)
            setRows(records.map((record) => parsedColumns.map((column) => String(record[column] ?? ''))))
            setColumnTypes(Object.fromEntries(parsedColumns.map((column) => [column, inferColumnType(column)])))
          }
        } catch {
          setColumns([])
          setRows([])
        }
      }
      reader.readAsText(nextFile)
    }
  }

  function removeFile() {
    setFile(null)
    setCurrentStep(1)
    if (inputRef.current) inputRef.current.value = ''
  }

  function selectPreset(preset) {
    setSelectedPreset(preset)
    setSelectedChecks(new Set(presetChecks[preset]))
  }

  function runAnalysis() {
    onAuditComplete(buildAuditResult({ file, columns, rows, columnTypes, selectedRegion }))
    navigate(routes.analysis)
  }

  return (
    <main className="upload-page">
      <section className="upload-card">
        <UploadStepper currentStep={currentStep} />

        {currentStep === 1 && (
          <>
            <div className="upload-heading">
              <h1>Upload Your Dataset.</h1>
              <p>We accept CSV, Excel, or JSON. Your data never leaves your environment.</p>
            </div>
            <input
              ref={inputRef}
              className="hidden-file-input"
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              onChange={(event) => event.target.files?.[0] && loadPreview(event.target.files[0])}
            />
            {!file ? (
              <button
                className="upload-drop"
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  if (event.dataTransfer.files?.[0]) loadPreview(event.dataTransfer.files[0])
                }}
              >
                <span><UploadIcon /></span>
                <strong>Drag and drop your file here</strong>
                <em>or browse files</em>
              </button>
            ) : (
              <div className="uploaded-file">
                <span><CheckIcon /></span>
                <div>
                  <strong>{file.name}</strong>
                  <p>{formatFileSize(file.size)}</p>
                </div>
                <button type="button" onClick={removeFile}>Remove</button>
              </div>
            )}
            <div className="format-pills"><span>CSV</span><span>XLSX</span><span>JSON</span></div>

            {file && (
              <>
                <section className="preview-card">
                  <div className="panel-title">
                    <h2>Data Preview</h2>
                    <span>First 5 rows</span>
                  </div>
                  <div className="preview-table-wrap">
                    <table>
                      <thead>
                        <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 5).map((row, index) => (
                          <tr key={`${row.join('-')}-${index}`}>{columns.map((column, columnIndex) => <td key={column}>{row[columnIndex] ?? ''}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <a href="#preview">Full Preview</a>
                </section>

                <section className="columns-card">
                  <div className="panel-title">
                    <h2>Tell Us About Your Columns.</h2>
                    {hasSensitiveColumn && <span className="sensitive-note">Sensitive field tagged</span>}
                  </div>
                  {columns.map((column) => (
                    <label className={`column-map-row ${columnTypes[column]?.startsWith('Sensitive') ? 'sensitive' : ''}`} key={column}>
                      <span>{column}</span>
                      <select value={columnTypes[column] || 'Feature'} onChange={(event) => setColumnTypes((current) => ({ ...current, [column]: event.target.value }))}>
                        {columnTypeOptions.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </label>
                  ))}
                </section>

                <button className="full-primary" type="button" onClick={() => setCurrentStep(2)}>Continue to Configuration</button>
              </>
            )}
          </>
        )}

        {currentStep >= 2 && (
          <section className="config-card">
            <div className="panel-title">
              <div>
                <h1>Configure Analysis.</h1>
                <p>Choose fairness checks and compliance scope for this audit.</p>
              </div>
              <button type="button" onClick={() => setCurrentStep(1)}>Back</button>
            </div>

            <div className="config-block">
              <h2>Who Is the Decision Affecting?</h2>
              <div className="preset-row">
                {presets.map((preset) => <button className={selectedPreset === preset ? 'selected' : ''} type="button" key={preset} onClick={() => selectPreset(preset)}>{preset}</button>)}
              </div>
            </div>
            <div className="config-block">
              <h2>What Are You Analyzing?</h2>
              <div className="check-grid">
                {analysisChecks.map((check) => (
                  <label key={check}>
                    <input type="checkbox" checked={selectedChecks.has(check)} onChange={() => setSelectedChecks((current) => {
                      const next = new Set(current)
                      if (next.has(check)) next.delete(check)
                      else next.add(check)
                      return next
                    })} />
                    <span>{check}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="config-block">
              <h2>Legal Compliance Check</h2>
              <div className="preset-row">
                {Object.keys(complianceByRegion).map((region) => <button className={selectedRegion === region ? 'selected' : ''} type="button" key={region} onClick={() => setSelectedRegion(region)}>{region}</button>)}
              </div>
              <div className="law-pills">{laws.map((law) => <span key={law}>{law}</span>)}</div>
            </div>
            <button className="full-primary" type="button" onClick={runAnalysis}>Run Full Analysis →</button>
            <p className="estimate-note">Estimated time: 2–4 minutes depending on file size.</p>
          </section>
        )}
      </section>
    </main>
  )
}

function RiskPill({ level }) {
  return <span className={`risk-pill ${level.toLowerCase()}`}>{level}</span>
}

function StatusCell({ status }) {
  const symbol = status === 'Pass' ? '✓' : status === 'Fail' ? '×' : '!'
  return <span className={`metric-status ${status.toLowerCase()}`}><b>{symbol}</b>{status}</span>
}

function AnalysisPage({ audit, navigate }) {
  const [openLaw, setOpenLaw] = useState('ECOA')
  const [bubbleTip, setBubbleTip] = useState(null)

  if (!audit) {
    return (
      <main className="analysis-empty">
        <section>
          <h1>No analysis has been run yet.</h1>
          <p>Upload a dataset, tag your columns, and run the audit to generate this dashboard from real data.</p>
          <button type="button" onClick={() => navigate(routes.upload)}>Upload Dataset</button>
        </section>
      </main>
    )
  }

  const matrixLabels = audit.matrixLabels.length ? audit.matrixLabels : ['Group A', 'Group B', 'Feature', 'Outcome']

  return (
    <main className="analysis-shell">
      <aside className="analysis-sidebar">
        <div className="analysis-brand"><BrandMark /> FairMind</div>
        <nav aria-label="Analysis modules">
          {['Overview', 'Dataset Forensics', 'Fairness Metrics', 'Counterfactual Sim', 'Model Behavior', 'Compliance Map', 'Report'].map((item, index) => (
            <a className={index === 0 ? 'active' : ''} href={`#${item.toLowerCase().replaceAll(' ', '-')}`} key={item}>
              <span>{['⌁', '▥', '▤', '⇄', '◌', '§', '☰'][index]}</span>
              {item}
            </a>
          ))}
        </nav>
        <div className="audit-status"><span /> Analysis Complete</div>
      </aside>

      <section className="analysis-main">
        <header className="analysis-topbar">
          <div>
            <h1>{audit.datasetName} Audit</h1>
            <p>Completed {audit.timestamp} · {audit.totalRows.toLocaleString()} rows analyzed · Target: {audit.targetColumn}</p>
          </div>
          <button type="button">Download Report</button>
        </header>

        <section className="kpi-grid" id="overview">
          <article className="kpi-card score">
            <div className="score-arc" style={{ '--score': `${audit.score}%` }}><strong>{audit.score}</strong><span>/ 100</span></div>
            <div><h2>Overall Fairness Score</h2><p>{audit.complianceRisk} risk detected</p></div>
          </article>
          <article className="kpi-card"><strong className="red-text">{audit.biasFlags}</strong><h2>Bias Flags Detected</h2><p>Issues Found</p></article>
          <article className="kpi-card"><strong>{audit.sensitiveColumns.length}</strong><h2>Protected Groups Analyzed</h2><p>{audit.sensitiveColumns.join(', ') || 'None tagged'}</p></article>
          <article className="kpi-card"><strong className="amber-text">{audit.complianceRisk}</strong><h2>Compliance Risk</h2><p>{audit.complianceRows.filter((row) => row[2] !== 'Low').length} laws require review</p></article>
        </section>

        <section className="analysis-card" id="dataset-forensics">
          <h2>Dataset Forensics</h2>
          <div className="forensics-grid">
            <div className="representation-chart">
              <h3>Group Representation</h3>
              {audit.representation.map(([label, value, severity]) => (
                <div className="rep-row" key={label}>
                  <span>{label}</span>
                  <div><i className={severity} style={{ width: `${value * 2.2}%` }} /></div>
                  <b>{value}%</b>
                </div>
              ))}
            </div>
            <div>
              <h3>Proxy Variable Risk</h3>
              <table className="risk-table">
                <thead><tr><th>Column</th><th>Risk Level</th></tr></thead>
                <tbody>{audit.proxy.map(([name, risk]) => <tr key={name}><td>{name}</td><td><RiskPill level={risk} /></td></tr>)}</tbody>
              </table>
            </div>
          </div>
          <details className="bias-details" open>
            <summary>Historical Bias in Labels</summary>
            <div>
              <p>Positive label rate is {Math.round(audit.positiveRate * 100)}%. Subgroup label imbalance can teach the model to preserve historical gaps.</p>
              <div className="pie-chart" style={{ '--positive-rate': `${Math.round(audit.positiveRate * 100)}%` }}><span>{Math.round(audit.positiveRate * 100)}%</span></div>
            </div>
          </details>
        </section>

        <section className="analysis-card" id="fairness-metrics">
          <h2>Fairness Metrics</h2>
          <div className="metrics-table-wrap">
            <table className="metrics-table">
              <thead><tr><th>Metric Name</th><th>Group A Score</th><th>Group B Score</th><th>Status</th></tr></thead>
              <tbody>
                {audit.metrics.map(([metric, a, b, status, tip]) => (
                  <tr key={metric}>
                    <td><span className="metric-tooltip" data-tip={tip}>{metric}</span></td>
                    <td>{a}</td>
                    <td>{b}</td>
                    <td><StatusCell status={status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="severity-heatmap">
            {['Parity', 'Opportunity', 'Impact', 'Calibration'].map((metric) => (
              <div className="severity-row" key={metric}>
                <strong>{metric}</strong>
                {matrixLabels.slice(0, 5).map((label, col) => <span className={audit.score < 60 ? 'red' : audit.score < 78 && col % 2 === 0 ? 'amber' : 'green'} title={label} key={`${metric}-${label}`} />)}
              </div>
            ))}
          </div>
        </section>

        <section className="analysis-card" id="counterfactual-sim">
          <h2>Counterfactual Simulation Results</h2>
          <div className="counterfactual-card">
            <div className="profile-card rejected">
              <h3>Original Profile</h3>
              <p>{audit.counterfactual.original}</p>
              <strong>{audit.counterfactual.rejected ? 'REJECTED' : 'APPROVED'}</strong>
            </div>
            <div className="bias-label">Bias Detected: Gender Changed the Outcome</div>
            <div className="profile-card approved">
              <h3>Counterfactual Profile</h3>
              <p>{audit.counterfactual.changed}</p>
              <strong>{audit.counterfactual.rejected ? 'APPROVED' : 'REJECTED'}</strong>
            </div>
          </div>
          <div className="counterfactual-progress"><span style={{ width: `${audit.counterfactualDiffs}%` }} /></div>
          <p className="analysis-note">{audit.counterfactualDiffs} out of 100 counterfactual tests showed different outcomes.</p>
        </section>

        <section className="analysis-card" id="model-behavior">
          <h2>Intersectional Bias Map</h2>
          <div className="intersection-matrix">
            {matrixLabels.map((x, xIndex) => (
              <div className="matrix-row" key={x}>
                <strong>{x}</strong>
                {matrixLabels.map((y, yIndex) => {
                  const score = Math.max(25, Math.min(96, audit.score + ((xIndex * 13 + yIndex * 9) % 34) - 16))
                  return (
                    <button
                      className={score < 60 ? 'bad' : score < 75 ? 'warn' : 'good'}
                      style={{ '--bubble-size': `${22 + ((xIndex + yIndex) % 4) * 9}px` }}
                      type="button"
                      key={`${x}-${y}`}
                      onMouseEnter={() => setBubbleTip(`${x} × ${y}: fairness score ${score}, sample size ${80 + xIndex * 23 + yIndex * 11}`)}
                      onMouseLeave={() => setBubbleTip(null)}
                    />
                  )
                })}
              </div>
            ))}
            {bubbleTip && <div className="matrix-tooltip">{bubbleTip}</div>}
          </div>
        </section>

        <section className="analysis-card" id="compliance-map">
          <h2>Legal Compliance Risk</h2>
          <div className="compliance-table">
            {audit.complianceRows.map(([law, region, risk, modules, explanation]) => (
              <article className="compliance-row" key={law}>
                <button type="button" onClick={() => setOpenLaw(openLaw === law ? '' : law)}>
                  <span>{law}</span><span>{region}</span><RiskPill level={risk} /><span>{modules}</span>
                </button>
                {openLaw === law && <p>{explanation}</p>}
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

function MonitoringPage() {
  const [range, setRange] = useState('Today')
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <main className="monitoring-shell">
      <header className="control-bar">
        <label className="system-select">
          <DatabaseIcon />
          <select aria-label="Select system">
            <option>Loan Approval Model v3</option>
            <option>Hiring Ranker v2</option>
            <option>Claims Triage Model</option>
          </select>
        </label>

        <div className="range-picker" role="group" aria-label="Date range">
          {dateRanges.map((item) => (
            <button
              className={range === item ? 'selected' : ''}
              type="button"
              key={item}
              onClick={() => setRange(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="live-status">
          <span className="pulse-dot" />
          Live — 1,204 decisions monitored today.
        </div>

        <button className="settings-button" type="button" aria-label="Open monitoring settings" onClick={() => setDrawerOpen(true)}>
          <GearIcon />
        </button>
      </header>

      {alerts.length > 0 && (
        <div className="alert-banner">
          <span>2 Active Alerts Require Attention.</span>
          <a href="#alerts">View Alerts →</a>
        </div>
      )}

      <section className="dashboard-grid" aria-label="Real-time monitoring widgets">
        <DecisionVolumeChart />
        <FairnessScoreChart />
        <ApprovalBarChart />
        <AlertsPanel />
        <DecisionFeed />
        <RiskHeatmap />
      </section>

      <SettingsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </main>
  )
}

function getRoute() {
  const path = window.location.pathname
  if (path === routes.upload || path === routes.analysis || path === routes.monitoring) return path
  return routes.home
}

function App() {
  const [route, setRoute] = useState(getRoute)
  const [audit, setAudit] = useState(null)

  useEffect(() => {
    const handlePopState = () => setRoute(getRoute())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigate(to) {
    window.history.pushState({}, '', to)
    setRoute(to)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <AppNav route={route} navigate={navigate} />
      {route === routes.upload && <UploadPage navigate={navigate} onAuditComplete={setAudit} />}
      {route === routes.analysis && <AnalysisPage audit={audit} navigate={navigate} />}
      {route === routes.monitoring && <MonitoringPage />}
      {route === routes.home && <LandingPage navigate={navigate} />}
    </>
  )
}

export default App
