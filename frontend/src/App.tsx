import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Plotly from 'plotly.js-dist-min'
import Papa from 'papaparse'
import type { Data, Layout } from 'plotly.js'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'

type AnnualRow = {
  'RSO Name': string
  'Final Allocation': string
}

type YearlyRow = {
  'RSO Name': string
  Type: string
  Requested: string
  'Final Allocation': string
}

type ChartMode = 'bar' | 'stacked' | 'donut' | 'treemap' | 'scatter3d'
type DatasetMode = 'combined' | 'annual' | 'yearly'
type SortKey = 'rank' | 'name' | 'requested' | 'funded' | 'annual' | 'yearly'
type SortDirection = 'asc' | 'desc'

type RsoTableRow = {
  name: string
  annualFunded: number
  yearlyRequested: number
  yearlyFunded: number
  totalFunded: number
}

const CURRENCY = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Our Work', path: '/work' },
  { label: 'Operations', path: '/operations' },
  { label: 'Quick Links', path: '/links' },
  { label: 'Contact Us', path: '/contact' },
  { label: 'Allocations', path: '/allocations' },
]

function PlotlyChart({
  data,
  layout,
  height = 640,
}: {
  data: Partial<Data>[]
  layout: Partial<Layout>
  height?: number
}) {
  const chartRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const chartNode = chartRef.current
    if (!chartNode) return

    void Plotly.react(
      chartNode,
      data as Data[],
      layout as Layout,
      { responsive: true, displaylogo: false },
    )

    return () => {
      Plotly.purge(chartNode)
    }
  }, [data, layout])

  return <div ref={chartRef} style={{ width: '100%', height: `${height}px` }} />
}

function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-page">
      <header className="top-header">
        <div className="container">
          <a href="https://uchicago.edu" target="_blank" rel="noreferrer">
            The University of Chicago
          </a>
          <nav>
            <a href="https://websites.uchicago.edu/support-training/voices-support/uchicago-voices-template-tutorial/" target="_blank" rel="noreferrer">Tutorial</a>
            <a href="https://websites.uchicago.edu/support-training/voices-support/" target="_blank" rel="noreferrer">Support</a>
          </nav>
        </div>
      </header>

      <header className="site-header">
        <div className="identity">
          <a href="https://voices.uchicago.edu/ucusg/" target="_blank" rel="noreferrer">
            <img
              src="https://d3qi0qp55mx5f5.cloudfront.net/shared-resources/i/template/uchicago_wordmark_maroon.svg"
              alt="University of Chicago"
            />
          </a>
          <h1>Undergraduate Student Government</h1>
        </div>
        <nav className="main-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="footer">
        <div className="container footer-row">
          <div>
            <img
              className="footer-wordmark"
              src="https://d3qi0qp55mx5f5.cloudfront.net/shared-resources/i/template/uchicago_wordmark.svg"
              alt="The University of Chicago"
            />
            <p>5801 S Ellis Ave, Chicago, IL 60637</p>
            <p>
              <a href="tel:7737025800">773.702.5800</a> |{' '}
              <a href="mailto:itservices@uchicago.edu">itservices@uchicago.edu</a>
            </p>
          </div>
          <div>
            <p>USG Public Site Replica + Allocation Dashboard</p>
            <p className="muted">Copyright University of Chicago</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Hero({ title, subtitle, image }: { title: string; subtitle?: string; image: string }) {
  return (
    <section className="hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url(${image})` }}>
      <div className="container hero-inner">
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </section>
  )
}

function HomePage() {
  return (
    <>
      <Hero
        title="About Your Department"
        subtitle="Subheading Text - There is no life in thee, now, except that rocking life."
        image="https://voices.uchicago.edu/ucusg/files/2016/12/uchicago8-1ua1ok7.jpg"
      />
      <section className="container section">
        <h3>Welcome to your Basic Page</h3>
        <p>
          This page replicates the Voices Divi structure for USG public-facing content. It is now brought into this frontend codebase as a routed React site, preserving the maroon UChicago visual language and section hierarchy.
        </p>
      </section>
    </>
  )
}

function AboutPage() {
  return (
    <>
      <Hero title="Events" image="https://voices.uchicago.edu/ucusg/files/2016/10/header_chicago_08-141sf3y.jpg" />
      <section className="container section grid-3">
        {['Event #1', 'Event #2', 'Event #3'].map((title) => (
          <article key={title} className="card">
            <h4>{title}</h4>
            <p>Wednesday, October 5</p>
            <p>11:15 a.m.-1:15 p.m.</p>
            <p>Main Quad</p>
          </article>
        ))}
      </section>
    </>
  )
}

function WorkPage() {
  const posts = [
    {
      title: 'Blank Post',
      text: 'Try out your own test blog post here. You can add categories and tags to organize posts.',
      image: 'https://voices.uchicago.edu/ucusg/files/2016/10/header_chicago_01-1376zyo-1080x675.jpg',
    },
    {
      title: 'Welcome to Your Blog News Feed',
      text: 'The News Page is set up as a blog feed with media, visibility controls, and categories.',
      image: 'https://voices.uchicago.edu/ucusg/files/2016/12/uchicago8-1ua1ok7-1080x675.jpg',
    },
    {
      title: 'Hello world!',
      text: 'Welcome to your UChicago Voices site. This mirrors the publication-style work feed.',
      image: 'https://voices.uchicago.edu/ucusg/files/2016/12/uchicago14-2518tvn-1080x675.jpg',
    },
  ]

  return (
    <>
      <Hero title="Our Work" image="https://voices.uchicago.edu/ucusg/files/2016/12/uchicago3-2f1bvws.jpg" />
      <section className="container section grid-3">
        {posts.map((post) => (
          <article key={post.title} className="card post-card">
            <img src={post.image} alt={post.title} />
            <h4>{post.title}</h4>
            <p>{post.text}</p>
          </article>
        ))}
      </section>
    </>
  )
}

function OperationsPage() {
  return (
    <>
      <Hero title="Staff Directory" image="https://voices.uchicago.edu/ucusg/files/2016/12/uchicago5-1j24xj4.jpg" />
      <section className="container section">
        <div className="staff-grid">
          {Array.from({ length: 4 }).map((_, idx) => (
            <article className="card staff" key={idx}>
              <img src="https://voices.uchicago.edu/ucusg/files/2016/12/staff_headshot-1cxbegc.jpg" alt="Staff member" />
              <h4>Staff Name</h4>
              <p className="muted">Job Title or Position</p>
              <p>Committee and operational support profile card replicated from Voices operations page.</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function LinksPage() {
  const links = [
    { label: 'USG Home', href: 'https://voices.uchicago.edu/ucusg/' },
    { label: 'Accessibility', href: 'https://accessibility.uchicago.edu/' },
    { label: 'Voices Support', href: 'https://websites.uchicago.edu/support-training/voices-support/' },
    { label: 'UChicago', href: 'https://uchicago.edu' },
  ]
  return (
    <>
      <Hero title="Quick Links" image="https://voices.uchicago.edu/ucusg/files/2016/10/header_uchicago_12-1djg4rf.jpg" />
      <section className="container section grid-2">
        {links.map((link) => (
          <a className="card link-card" key={link.href} href={link.href} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        ))}
      </section>
    </>
  )
}

function ContactPage() {
  return (
    <>
      <Hero title="Contact Us" image="https://voices.uchicago.edu/ucusg/files/2016/10/header_uchicago_15-2gz4mrk.jpg" />
      <section className="container section">
        <h3>Contact Form</h3>
        <p>To configure contact routing, set the destination mailbox in your form provider settings. This page mirrors the original Voices guidance and placeholder form block.</p>
        <div className="card">
          <p>Please select a valid form</p>
        </div>
      </section>
    </>
  )
}

function AllocationsPage() {
  const [annualRows, setAnnualRows] = useState<AnnualRow[]>([])
  const [yearlyRows, setYearlyRows] = useState<YearlyRow[]>([])
  const [chartMode, setChartMode] = useState<ChartMode>('bar')
  const [datasetMode, setDatasetMode] = useState<DatasetMode>('combined')
  const [topCount, setTopCount] = useState(25)
  const [showAllRsos, setShowAllRsos] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('funded')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [annualRes, yearlyRes] = await Promise.all([
        fetch('/annual_allocations.csv').then((res) => res.text()),
        fetch('/yearly_allocations.csv').then((res) => res.text()),
      ])

      const annualParsed = Papa.parse<AnnualRow>(annualRes, {
        header: true,
        skipEmptyLines: true,
      }).data
      const yearlyParsed = Papa.parse<YearlyRow>(yearlyRes, {
        header: true,
        skipEmptyLines: true,
      }).data

      setAnnualRows(annualParsed)
      setYearlyRows(yearlyParsed)
      setLoading(false)
    }

    void loadData()
  }, [])

  const totals = useMemo(() => {
    const annual = annualRows.reduce(
      (sum, row) => sum + (Number.parseFloat(row['Final Allocation'] || '0') || 0),
      0,
    )
    const yearly = yearlyRows.reduce(
      (sum, row) => sum + (Number.parseFloat(row['Final Allocation'] || '0') || 0),
      0,
    )
    return { annual, yearly, combined: annual + yearly }
  }, [annualRows, yearlyRows])

  const yearlyByType = useMemo(() => {
    const bucket = new Map<string, number>()
    for (const row of yearlyRows) {
      const type = (row.Type || 'Unspecified').trim() || 'Unspecified'
      const value = Number.parseFloat(row['Final Allocation'] || '0') || 0
      bucket.set(type, (bucket.get(type) ?? 0) + value)
    }
    return Array.from(bucket.entries()).sort((a, b) => b[1] - a[1])
  }, [yearlyRows])

  const activeTotals = datasetMode === 'combined' ? totals.combined : datasetMode === 'annual' ? totals.annual : totals.yearly

  const tableRows = useMemo<RsoTableRow[]>(() => {
    const annualFundedMap = new Map<string, number>()
    const yearlyRequestedMap = new Map<string, number>()
    const yearlyFundedMap = new Map<string, number>()
    const names = new Set<string>()

    for (const row of annualRows) {
      const name = row['RSO Name']?.trim()
      if (!name) continue
      names.add(name)
      annualFundedMap.set(
        name,
        (annualFundedMap.get(name) ?? 0) + (Number.parseFloat(row['Final Allocation'] || '0') || 0),
      )
    }

    for (const row of yearlyRows) {
      const name = row['RSO Name']?.trim()
      if (!name) continue
      names.add(name)
      yearlyRequestedMap.set(
        name,
        (yearlyRequestedMap.get(name) ?? 0) + (Number.parseFloat(row.Requested || '0') || 0),
      )
      yearlyFundedMap.set(
        name,
        (yearlyFundedMap.get(name) ?? 0) + (Number.parseFloat(row['Final Allocation'] || '0') || 0),
      )
    }

    return Array.from(names).map((name) => {
      const annualFunded = annualFundedMap.get(name) ?? 0
      const yearlyRequested = yearlyRequestedMap.get(name) ?? 0
      const yearlyFunded = yearlyFundedMap.get(name) ?? 0
      const totalFunded = annualFunded + yearlyFunded
      return {
        name,
        annualFunded,
        yearlyRequested,
        yearlyFunded,
        totalFunded,
      }
    })
  }, [annualRows, yearlyRows])

  const filteredAndSortedRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const filtered = q
      ? tableRows.filter((row) => row.name.toLowerCase().includes(q))
      : tableRows

    const sorted = [...filtered].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1
      if (sortKey === 'name') return direction * a.name.localeCompare(b.name)
      if (sortKey === 'requested') return direction * (a.yearlyRequested - b.yearlyRequested)
      if (sortKey === 'annual') return direction * (a.annualFunded - b.annualFunded)
      if (sortKey === 'yearly') return direction * (a.yearlyFunded - b.yearlyFunded)
      if (sortKey === 'funded') return direction * (a.totalFunded - b.totalFunded)
      return direction * (a.totalFunded - b.totalFunded)
    })

    return sorted.map((row, index) => ({ ...row, rank: index + 1 }))
  }, [searchQuery, sortDirection, sortKey, tableRows])

  const handleHeaderSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))
      return
    }
    setSortKey(key)
    setSortDirection('desc')
  }

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return ''
    return sortDirection === 'desc' ? ' \u2193' : ' \u2191'
  }

  const chartFigure = useMemo(() => {
    const effectiveTopCount = showAllRsos ? filteredAndSortedRows.length : topCount
    const topRows = filteredAndSortedRows.slice(0, effectiveTopCount)
    const names = topRows.map((row) => row.name)
    const annualValues = topRows.map((row) => row.annualFunded)
    const yearlyValues = topRows.map((row) => row.yearlyFunded)
    const totalValues = topRows.map((row) => row.totalFunded)

    const activeValues =
      datasetMode === 'combined' ? totalValues : datasetMode === 'annual' ? annualValues : yearlyValues

    if (chartMode === 'donut') {
      const topTypes = yearlyByType.slice(0, 8)
      const remaining = yearlyByType.slice(8).reduce((sum, [, value]) => sum + value, 0)
      const labels = topTypes.map(([type]) => type)
      const values = topTypes.map(([, value]) => value)
      if (remaining > 0) {
        labels.push('Other')
        values.push(remaining)
      }
      return {
        data: [
          {
            type: 'pie',
            labels,
            values,
            hole: 0.52,
            sort: false,
            marker: {
              colors: [
                '#800000',
                '#9a2323',
                '#b13a3a',
                '#c75a5a',
                '#d87d7d',
                '#e69f9f',
                '#efc0c0',
                '#f5dcdc',
                '#dddddd',
              ],
            },
            textinfo: 'label+percent',
          },
        ],
        layout: {
          title: { text: 'Yearly Allocation Mix by Request Type' },
        },
      }
    }

    if (chartMode === 'stacked') {
      return {
        data: [
          {
            type: 'bar',
            x: names,
            y: annualValues,
            name: 'Annual Funded',
            marker: { color: '#800000' },
          },
          {
            type: 'bar',
            x: names,
            y: yearlyValues,
            name: 'Yearly Funded',
            marker: { color: '#c87373' },
          },
        ],
        layout: {
          title: { text: 'Annual vs Yearly Funded by RSO' },
          barmode: 'stack',
          xaxis: { tickangle: -35 },
          yaxis: { title: { text: 'Funded Amount (USD)' } },
        },
      }
    }

    if (chartMode === 'treemap') {
      return {
        data: [
          {
            type: 'treemap',
            labels: names,
            parents: names.map(() => ''),
            values: activeValues,
            marker: {
              colors: activeValues,
              colorscale: 'Reds',
            },
          },
        ],
        layout: {
          title: {
            text:
              datasetMode === 'combined'
                ? 'Treemap: Combined Funded Allocations'
                : datasetMode === 'annual'
                  ? 'Treemap: Annual Funded Allocations'
                  : 'Treemap: Yearly Funded Allocations',
          },
        },
      }
    }

    if (chartMode === 'scatter3d') {
      return {
        data: [
          {
            type: 'scatter3d',
            mode: 'markers',
            x: annualValues,
            y: yearlyValues,
            z: totalValues,
            text: names.map(
              (name, idx) =>
                `${name}<br>Annual: ${CURRENCY.format(annualValues[idx])}<br>Yearly: ${CURRENCY.format(yearlyValues[idx])}<br>Total: ${CURRENCY.format(totalValues[idx])}`,
            ),
            marker: {
              size: totalValues.map((value) => Math.max(5, Math.min(16, value / 950))),
              color: totalValues,
              colorscale: 'Reds',
              opacity: 0.78,
            },
            hovertemplate: '%{text}<extra></extra>',
          },
        ],
        layout: {
          title: { text: '3D Relationship: Annual vs Yearly vs Total' },
          scene: {
            xaxis: { title: { text: 'Annual Funded' } },
            yaxis: { title: { text: 'Yearly Funded' } },
            zaxis: { title: { text: 'Total Funded' } },
          },
        },
      }
    }

    return {
      data: [
        {
          type: 'bar',
          y: names,
          x: activeValues,
          orientation: 'h',
          marker: {
            color: activeValues,
            colorscale: 'Reds',
          },
          hovertemplate: '%{y}<br>%{x:$,.0f}<extra></extra>',
        },
      ],
      layout: {
        title: {
          text:
            datasetMode === 'combined'
              ? 'Top RSOs by Combined Funded Allocation'
              : datasetMode === 'annual'
                ? 'Top RSOs by Annual Funded Allocation'
                : 'Top RSOs by Yearly Funded Allocation',
        },
        xaxis: { title: { text: 'Funded Amount (USD)' } },
        yaxis: { automargin: true },
      },
    }
  }, [filteredAndSortedRows, topCount, showAllRsos, datasetMode, chartMode, yearlyByType])

  const displayedTableRows = useMemo(
    () => filteredAndSortedRows.slice(0, showAllRsos ? filteredAndSortedRows.length : topCount),
    [filteredAndSortedRows, topCount, showAllRsos],
  )

  return (
    <>
      <section className="hero hero-allocations">
        <div className="hero-overlay">
          <div className="alloc-topbar">
            <p>USG Allocation Dashboard</p>
            <button type="button">Export CSV</button>
          </div>
          <h2>USG Allocation Intelligence Dashboard</h2>
          <p>
            Track annual and event-based RSO allocations with polished analytics, searchable records, and sortable ranking views.
          </p>
          <div className="stats">
            <article>
              <h3>Annual Final Allocation</h3>
              <p>{CURRENCY.format(totals.annual)}</p>
            </article>
            <article>
              <h3>Yearly Final Allocation</h3>
              <p>{CURRENCY.format(totals.yearly)}</p>
            </article>
            <article>
              <h3>Combined Tracked Total</h3>
              <p>{CURRENCY.format(totals.combined)}</p>
            </article>
          </div>
        </div>
      </section>
      <main className="content container">
        <section className="panel controls">
          <h3>Dashboard Controls</h3>
          <div className="control-grid">
            <label>
              Dataset
              <select value={datasetMode} onChange={(event) => setDatasetMode(event.target.value as DatasetMode)}>
                <option value="combined">Combined (Annual + Yearly)</option>
                <option value="annual">Annual only</option>
                <option value="yearly">Yearly only</option>
              </select>
            </label>
            <label>
              Chart Mode
              <select value={chartMode} onChange={(event) => setChartMode(event.target.value as ChartMode)}>
                <option value="bar">Ranked Horizontal Bar</option>
                <option value="stacked">Stacked Annual + Yearly Bars</option>
                <option value="donut">Donut (Request Type Mix)</option>
                <option value="treemap">Treemap (Allocation Footprint)</option>
                <option value="scatter3d">3D Relationship (Optional)</option>
              </select>
            </label>
            <label>
              Top RSOs shown: {showAllRsos ? 'All' : topCount}
              <div className="count-controls">
                <button
                  type="button"
                  onClick={() => setTopCount((prev) => Math.max(10, prev - 5))}
                  disabled={showAllRsos}
                  aria-label="Decrease top RSOs shown"
                >
                  -
                </button>
                <input
                  type="number"
                  min={10}
                  max={Math.max(10, tableRows.length)}
                  step={5}
                  value={topCount}
                  disabled={showAllRsos}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value)
                    if (Number.isNaN(nextValue)) return
                    const clamped = Math.max(10, Math.min(Math.max(10, tableRows.length), nextValue))
                    setTopCount(clamped)
                  }}
                />
                <button
                  type="button"
                  onClick={() => setTopCount((prev) => Math.min(Math.max(10, tableRows.length), prev + 5))}
                  disabled={showAllRsos}
                  aria-label="Increase top RSOs shown"
                >
                  +
                </button>
              </div>
              <input
                type="range"
                min={10}
                max={Math.max(10, tableRows.length)}
                step={5}
                value={topCount}
                disabled={showAllRsos}
                onChange={(event) => setTopCount(Number(event.target.value))}
              />
              <span className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showAllRsos}
                  onChange={(event) => setShowAllRsos(event.target.checked)}
                />
                Show all RSOs
              </span>
            </label>
            <article className="focus-total">
              <h4>Current focus total</h4>
              <p>{CURRENCY.format(activeTotals)}</p>
            </article>
          </div>
        </section>

        <section className="panel chart">
          {loading ? (
            <p className="loading">Loading allocation data...</p>
          ) : (
            <PlotlyChart
              data={chartFigure.data as Partial<Data>[]}
              height={520}
              layout={{
                ...chartFigure.layout,
                paper_bgcolor: '#ffffff',
                plot_bgcolor: '#ffffff',
                margin: { l: 0, r: 0, b: 0, t: 42 },
                font: { family: 'Open Sans, Arial, sans-serif', color: '#2d2d2d' },
              } as Partial<Layout>}
            />
          )}
        </section>

        <section className="panel">
          <div className="table-toolbar">
            <div>
              <h3>RSO Allocation Table</h3>
              <p className="muted">
                Showing {displayedTableRows.length} of {filteredAndSortedRows.length} RSOs after search/sort.
              </p>
            </div>
            <div className="toolbar-controls">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search RSO name..."
              />
            </div>
          </div>

          <div className="table-wrap">
            <table className="alloc-table">
              <thead>
                <tr>
                  <th onClick={() => handleHeaderSort('rank')} className="sortable">Rank{sortIndicator('rank')}</th>
                  <th onClick={() => handleHeaderSort('name')} className="sortable">RSO{sortIndicator('name')}</th>
                  <th onClick={() => handleHeaderSort('requested')} className="sortable">Yearly Requested{sortIndicator('requested')}</th>
                  <th onClick={() => handleHeaderSort('yearly')} className="sortable">Yearly Funded{sortIndicator('yearly')}</th>
                  <th onClick={() => handleHeaderSort('annual')} className="sortable">Annual Funded{sortIndicator('annual')}</th>
                  <th onClick={() => handleHeaderSort('funded')} className="sortable">Total Funded{sortIndicator('funded')}</th>
                </tr>
              </thead>
              <tbody>
                {displayedTableRows.map((row) => (
                  <tr key={row.name}>
                    <td>{row.rank}</td>
                    <td>{row.name}</td>
                    <td>{CURRENCY.format(row.yearlyRequested)}</td>
                    <td>{CURRENCY.format(row.yearlyFunded)}</td>
                    <td>{CURRENCY.format(row.annualFunded)}</td>
                    <td>{CURRENCY.format(row.totalFunded)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel types">
          <h3>Yearly Allocation by Request Type</h3>
          <div className="type-grid">
            {yearlyByType.map(([type, value]) => (
              <article key={type}>
                <h4>{type}</h4>
                <p>{CURRENCY.format(value)}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <SiteShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/operations" element={<OperationsPage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/allocations" element={<AllocationsPage />} />
        </Routes>
      </SiteShell>
    </BrowserRouter>
  )
}

export default App
