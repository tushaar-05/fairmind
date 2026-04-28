import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import './App.css'
import { buildAuditResult } from './analysis/auditEngine'
import { COLUMN_TYPE_OPTIONS } from './analysis/constants'
import { parseDatasetFile, validateAuditInputs } from './analysis/ingestion'

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

function D3LineComparisonChart({ data }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !Array.isArray(data) || !data.length) return

    const width = 560
    const height = 230
    const margin = { top: 16, right: 20, bottom: 34, left: 36 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scalePoint().domain(data.map((d) => d.day)).range([0, innerWidth])
    const y = d3.scaleLinear().domain([0, d3.max(data, (d) => Math.max(d.a, d.b)) || 200]).nice().range([innerHeight, 0])

    g.append('g').call(d3.axisLeft(y).ticks(4)).attr('color', '#94a3b8')
    g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x)).attr('color', '#94a3b8')

    const lineA = d3.line().x((d) => x(d.day) ?? 0).y((d) => y(d.a))
    const lineB = d3.line().x((d) => x(d.day) ?? 0).y((d) => y(d.b))

    g.append('path').datum(data).attr('fill', 'none').attr('stroke', '#0d9488').attr('stroke-width', 3).attr('d', lineA)
    g.append('path').datum(data).attr('fill', 'none').attr('stroke', '#6366f1').attr('stroke-width', 3).attr('d', lineB)
  }, [data])

  return <svg ref={ref} className="line-chart d3-chart" role="img" aria-label="Decision volume by group over time" />
}

function D3ThresholdLineChart({ data, threshold = 70 }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !Array.isArray(data) || !data.length) return
    const width = 560
    const height = 230
    const margin = { top: 16, right: 20, bottom: 34, left: 36 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height)
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scalePoint().domain(data.map((d) => d.day)).range([0, innerWidth])
    const y = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0])

    g.append('g').call(d3.axisLeft(y).ticks(5)).attr('color', '#94a3b8')
    g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x)).attr('color', '#94a3b8')

    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', y(threshold))
      .attr('y2', y(threshold))
      .attr('stroke', '#dc2626')
      .attr('stroke-dasharray', '6 6')

    const line = d3.line().x((d) => x(d.day) ?? 0).y((d) => y(d.score))
    g.append('path').datum(data).attr('fill', 'none').attr('stroke', '#0d9488').attr('stroke-width', 3).attr('d', line)

    g.selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => x(d.day) ?? 0)
      .attr('cy', (d) => y(d.score))
      .attr('r', 3.5)
      .attr('fill', (d) => (d.score < threshold ? '#dc2626' : '#0d9488'))
  }, [data, threshold])

  return <svg ref={ref} className="line-chart d3-chart" role="img" aria-label="Rolling fairness score over time" />
}

function D3GroupedBarChart({ data }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !Array.isArray(data) || !data.length) return
    const width = 560
    const height = 240
    const margin = { top: 16, right: 20, bottom: 34, left: 36 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height)
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const groups = data.map((d) => d.day)
    const x0 = d3.scaleBand().domain(groups).range([0, innerWidth]).padding(0.2)
    const x1 = d3.scaleBand().domain(['a', 'b']).range([0, x0.bandwidth()]).padding(0.15)
    const y = d3.scaleLinear().domain([0, d3.max(data, (d) => Math.max(d.a, d.b)) || 100]).nice().range([innerHeight, 0])

    g.append('g').call(d3.axisLeft(y).ticks(4)).attr('color', '#94a3b8')
    g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x0)).attr('color', '#94a3b8')

    const group = g.selectAll('.bar-group').data(data).join('g').attr('transform', (d) => `translate(${x0(d.day)},0)`)
    group.append('rect').attr('x', x1('a')).attr('y', (d) => y(d.a)).attr('width', x1.bandwidth()).attr('height', (d) => innerHeight - y(d.a)).attr('fill', '#0d9488')
    group.append('rect').attr('x', x1('b')).attr('y', (d) => y(d.b)).attr('width', x1.bandwidth()).attr('height', (d) => innerHeight - y(d.b)).attr('fill', '#6366f1')
  }, [data])

  return <svg ref={ref} className="bar-chart d3-chart" role="img" aria-label="Approval rates for Group A and Group B" />
}

function D3HeatmapChart({ rows, cols, values }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !Array.isArray(rows) || !Array.isArray(cols) || !rows.length || !cols.length) return
    const width = 560
    const height = 240
    const margin = { top: 30, right: 10, bottom: 10, left: 90 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height)
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleBand().domain(cols).range([0, innerWidth]).padding(0.08)
    const y = d3.scaleBand().domain(rows).range([0, innerHeight]).padding(0.08)
    const color = d3.scaleLinear().domain([0, 80]).range(['#ecfeff', '#dc2626'])

    const flattened = rows.flatMap((r, ri) => cols.map((c, ci) => ({ r, c, v: values?.[ri]?.[ci] ?? 0 })))
    g.selectAll('rect')
      .data(flattened)
      .join('rect')
      .attr('x', (d) => x(d.c) ?? 0)
      .attr('y', (d) => y(d.r) ?? 0)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('rx', 6)
      .attr('fill', (d) => color(d.v))

    g.selectAll('.label')
      .data(flattened)
      .join('text')
      .attr('x', (d) => (x(d.c) ?? 0) + x.bandwidth() / 2)
      .attr('y', (d) => (y(d.r) ?? 0) + y.bandwidth() / 2 + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('fill', '#0f172a')
      .text((d) => d.v)

    g.append('g').call(d3.axisLeft(y).tickSize(0)).attr('color', '#64748b').select('.domain').remove()
    g.append('g').call(d3.axisTop(x).tickSize(0)).attr('color', '#64748b').select('.domain').remove()
  }, [rows, cols, values])

  return <svg ref={ref} className="line-chart d3-chart" role="img" aria-label="Live intersectional risk heatmap" />
}

function DecisionVolumeChart({ data }) {
  return (
    <ChartCard title="Decision Volume" className="wide-widget">
      <div className="legend-row">
        <span><i className="teal" /> Group A</span>
        <span><i className="indigo" /> Group B</span>
      </div>
      {data.length ? <D3LineComparisonChart data={data} /> : <p className="analysis-note">No volume data for selected range.</p>}
    </ChartCard>
  )
}

function FairnessScoreChart({ data }) {
  return (
    <ChartCard title="Fairness Score Over Time">
      {data.length ? <D3ThresholdLineChart data={data} threshold={70} /> : <p className="analysis-note">No fairness data for selected range.</p>}
    </ChartCard>
  )
}

function ApprovalBarChart({ data }) {
  const latest = data[data.length - 1]
  const gap = latest ? Math.max(0, latest.a - latest.b) : 0
  return (
    <ChartCard title="Approval Rate by Group">
      {data.length ? <D3GroupedBarChart data={data} /> : <p className="analysis-note">No approval data for selected range.</p>}
      <div className="delta-line">Gap Today: <strong>{gap} percentage points</strong> <span>{gap >= 15 ? '↑ above threshold' : 'within threshold'}</span></div>
    </ChartCard>
  )
}

function AlertsPanel({ items }) {
  return (
    <ChartCard title="Active Alerts">
      {items.length === 0 ? (
        <div className="empty-alerts">
          <span>✓</span>
          <strong>No anomalies detected in the last 24 hours.</strong>
        </div>
      ) : (
        <div className="alert-list">
          {items.map((alert) => (
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

function DecisionFeed({ rows }) {
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
            {rows.map((row) => (
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

function RiskHeatmap({ rows, cols, values }) {
  return (
    <ChartCard title="Live Intersectional Risk Map">
      <p className="updated-label">Last Updated: 3 min ago</p>
      <D3HeatmapChart rows={rows} cols={cols} values={values} />
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

function formatFileSize(bytes) {
  if (!bytes) return '0 KB'
  const units = ['B', 'KB', 'MB', 'GB']
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** power).toFixed(power === 0 ? 0 : 1)} ${units[power]}`
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
  const [setupErrors, setSetupErrors] = useState([])

  const laws = complianceByRegion[selectedRegion]
  const hasSensitiveColumn = useMemo(() => Object.values(columnTypes).some((type) => type.startsWith('Sensitive')), [columnTypes])

  async function loadPreview(nextFile) {
    setFile(nextFile)
    setCurrentStep(1)
    setSetupErrors([])
    try {
      const parsed = await parseDatasetFile(nextFile)
      setColumns(parsed.columns)
      setRows(parsed.rows)
      setColumnTypes(parsed.columnTypes)
    } catch (error) {
      setColumns([])
      setRows([])
      setColumnTypes({})
      setSetupErrors([error instanceof Error ? error.message : 'Could not parse file.'])
    }
  }

  function removeFile() {
    setFile(null)
    setCurrentStep(1)
    setSetupErrors([])
    if (inputRef.current) inputRef.current.value = ''
  }

  function selectPreset(preset) {
    setSelectedPreset(preset)
    setSelectedChecks(new Set(presetChecks[preset]))
  }

  function runAnalysis() {
    const validation = validateAuditInputs({ columns, rows, columnTypes })
    if (!validation.valid) {
      setSetupErrors(validation.errors)
      return
    }
    setSetupErrors([])
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
              <p>We accept CSV or JSON. Your data never leaves your environment.</p>
            </div>
            <input
              ref={inputRef}
              className="hidden-file-input"
              type="file"
              accept=".csv,.json"
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
            <div className="format-pills"><span>CSV</span><span>JSON</span></div>
            {setupErrors.length > 0 && (
              <div className="validation-list" role="alert">
                {setupErrors.map((error) => <p key={error}>{error}</p>)}
              </div>
            )}

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
                        {COLUMN_TYPE_OPTIONS.map((option) => <option key={option}>{option}</option>)}
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

function FlowStep({ title, endpoint, detail }) {
  return (
    <article className="flow-step">
      <h3>{title}</h3>
      <code>{endpoint}</code>
      <p>{detail}</p>
    </article>
  )
}

function FormulaCard({ title, formula, note }) {
  return (
    <article className="formula-card">
      <h3>{title}</h3>
      <code>{formula}</code>
      <p>{note}</p>
    </article>
  )
}

function AnalysisPage({ audit, navigate }) {
  const [openLaw, setOpenLaw] = useState('ECOA')
  const [bubbleTip, setBubbleTip] = useState(null)
  const [actionNote, setActionNote] = useState('')

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

        <section className="analysis-card" id="report">
          <h2>Platform Flow</h2>
          <div className="flow-grid">
            <FlowStep title="Data Ingestion" endpoint="POST /api/v1/datasets/upload" detail="Upload CSV, choose target + protected attribute, validate missing values and distributions." />
            <FlowStep title="Baseline Audit" endpoint="POST /api/v1/audits/run" detail="Train baseline model, generate predictions, and compute fairness metrics across groups." />
            <FlowStep title="Bias Mitigation" endpoint="POST /api/v1/audits/mitigate" detail="Apply in-processing mitigation constraints to improve fairness while preserving utility." />
            <FlowStep title="Data Export" endpoint="GET /api/v1/datasets/download_mitigated" detail="Export weighted dataset with fairness_weight for external model training pipelines." />
          </div>
          <div className="action-row">
            <button
              type="button"
              onClick={() => setActionNote('Mitigation request queued. In production this calls POST /api/v1/audits/mitigate.')}
            >
              Run Mitigation Engine
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setActionNote('Export prepared. In production this calls GET /api/v1/datasets/download_mitigated.')}
            >
              Export Data
            </button>
          </div>
          {actionNote && <p className="analysis-note">{actionNote}</p>}
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
                {audit.metrics.map((metric) => (
                  <tr key={metric.id}>
                    <td><span className="metric-tooltip" data-tip={metric.tip}>{metric.name}</span></td>
                    <td>{metric.groupAScore}</td>
                    <td>{metric.groupBScore}</td>
                    <td><StatusCell status={metric.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="analysis-callout-grid">
            <article className="analysis-callout">
              <h3>How metrics are computed</h3>
              {audit.metricDetails.map((detail) => (
                <div className="metric-explain" key={detail.metric}>
                  <strong>{detail.metric}</strong>
                  <p>{detail.formula}</p>
                  <p>{detail.threshold}</p>
                  <p>{detail.reason}</p>
                </div>
              ))}
            </article>
            <article className="analysis-callout">
              <h3>Confidence guardrails</h3>
              {audit.subgroupWarnings.length ? (
                <ul className="warning-list">
                  {audit.subgroupWarnings.map((warning) => <li key={warning}>{warning}</li>)}
                </ul>
              ) : (
                <p>All subgroup sample sizes meet the minimum threshold for stable trend checks.</p>
              )}
            </article>
          </div>
          <div className="formula-grid">
            <FormulaCard title="Demographic Parity" formula="Rate_B - Rate_A" note="Goal: value close to 0.0 indicates balanced approval outcomes." />
            <FormulaCard title="Equal Opportunity" formula="TPR_B - TPR_A" note="Compares true positive rates among actually qualified applicants." />
            <FormulaCard title="Disparate Impact" formula="Rate_B / Rate_A" note="80% rule: ratios below 0.80 indicate potential legal risk." />
            <FormulaCard title="Proxy Detection" formula="corr(feature, protected_attr) > 0.15" note="Flags non-sensitive features that may encode protected traits." />
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
            <div className="bias-label">Bias Detected: {audit.counterfactualAttribute} changed the outcome</div>
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
  const windowSize = range === 'Today' ? 1 : range === 'Last 7 Days' ? 7 : range === 'Last 30 Days' ? 30 : 3

  const filteredVolumeData = volumeData.slice(-Math.min(windowSize, volumeData.length))
  const filteredFairnessData = fairnessData.slice(-Math.min(windowSize, fairnessData.length))
  const filteredApprovalData = approvalData.slice(-Math.min(windowSize, approvalData.length))
  const liveDecisions = filteredVolumeData.reduce((total, item) => total + item.a + item.b, 0)

  const latestFairness = filteredFairnessData[filteredFairnessData.length - 1]?.score ?? 100
  const latestApproval = filteredApprovalData[filteredApprovalData.length - 1]
  const latestGap = latestApproval ? Math.max(0, latestApproval.a - latestApproval.b) : 0
  const computedAlerts = [
    ...(latestGap >= 15 ? [{ severity: 'critical', title: `Approval gap is ${latestGap} points in selected range`, time: 'just now' }] : []),
    ...(latestFairness < 70 ? [{ severity: 'warning', title: `Fairness score dropped to ${latestFairness}`, time: 'just now' }] : []),
    ...filteredVolumeData.some((entry) => entry.anomaly) ? [{ severity: 'warning', title: 'Decision volume anomaly detected', time: '5 min ago' }] : [],
  ]

  const feedRowsForRange = feedRows.slice(0, Math.max(3, Math.min(feedRows.length, windowSize + 1)))
  const heatmapRangeScale = range === 'Today' ? 1 : range === 'Last 7 Days' ? 0.95 : range === 'Last 30 Days' ? 0.9 : 1.05
  const scopedHeatmapValues = heatmapValues.map((row) => row.map((value) => Math.round(Math.max(8, Math.min(95, value * heatmapRangeScale)))))

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
          Live — {liveDecisions.toLocaleString()} decisions monitored in selected range.
        </div>

        <button className="settings-button" type="button" aria-label="Open monitoring settings" onClick={() => setDrawerOpen(true)}>
          <GearIcon />
        </button>
      </header>

      {computedAlerts.length > 0 && (
        <div className="alert-banner">
          <span>{computedAlerts.length} active alerts require attention.</span>
          <a href="#alerts">View Alerts →</a>
        </div>
      )}

      <section className="dashboard-grid" aria-label="Real-time monitoring widgets">
        <DecisionVolumeChart data={filteredVolumeData} />
        <FairnessScoreChart data={filteredFairnessData} />
        <ApprovalBarChart data={filteredApprovalData} />
        <AlertsPanel items={computedAlerts} />
        <DecisionFeed rows={feedRowsForRange} />
        <RiskHeatmap rows={heatmapRows} cols={heatmapCols} values={scopedHeatmapValues} />
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
