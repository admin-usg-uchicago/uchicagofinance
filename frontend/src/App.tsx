import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Papa from 'papaparse'
import { BarChart } from '@mui/x-charts/BarChart'
import { PieChart } from '@mui/x-charts/PieChart'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'

type Committee = 'cat' | 'csf' | 'pcc' | 'scf' | 'sgfc'

type AnnualRow = {
  'RSO Name': string
  Committee: Committee
  Requested: string
  'Final Allocation': string
}

type YearlyRow = {
  'RSO Name': string
  Committee: Committee
  'Request Description': string
  Type: string
  Requested: string
  'Final Allocation': string
}

type ChartMode = 'bar' | 'stacked' | 'donut'
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

const COMMITTEES: Committee[] = ['sgfc', 'pcc', 'cat', 'scf', 'csf']
const COMMITTEE_LABELS: Record<Committee, string> = {
  cat: 'Committee on Academic Teams',
  csf: 'Community Service Fund',
  pcc: 'Program Coordinating Council',
  scf: 'Sports Club Finance Committee',
  sgfc: 'Student Government Finance Committee',
}

type StreamConfig = {
  annualLabel: string
  yearlyLabel: string | null
}

const STREAMS: Record<Committee, StreamConfig> = {
  sgfc: { annualLabel: 'Main', yearlyLabel: 'Event/Travel' },
  pcc:  { annualLabel: 'Annual', yearlyLabel: null },
  cat:  { annualLabel: 'Annual', yearlyLabel: null },
  scf:  { annualLabel: 'Annual', yearlyLabel: 'Quarterly' },
  csf:  { annualLabel: 'Annual', yearlyLabel: 'Recurring' },
}

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Our Work', path: '/work' },
  { label: 'Operations', path: '/operations' },
  { label: 'Quick Links', path: '/links' },
  { label: 'Contact Us', path: '/contact' },
  { label: 'Allocations', path: '/allocations' },
]

const ANNUAL_COLOR = '#800000'
const YEARLY_COLOR = '#c87373'
const PIE_COLORS = [
  '#800000',
  '#9a2323',
  '#b13a3a',
  '#c75a5a',
  '#d87d7d',
  '#e69f9f',
  '#efc0c0',
  '#f5dcdc',
  '#dddddd',
]

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

type HistoryYear = {
  year: string
  annualPath: string
  yearlyPath: string
}

// Add new academic years by dropping CSVs in frontend/public/history/<year>/
// and appending an entry here. Missing files are surfaced as "no data yet".
const HISTORY_YEARS: HistoryYear[] = [
  {
    year: '2025-2026',
    annualPath: '/annual_allocations.csv',
    yearlyPath: '/yearly_allocations.csv',
  },
]

async function fetchCsvRows<T>(path: string): Promise<T[] | null> {
  const res = await fetch(path)
  if (!res.ok) return null
  const text = await res.text()
  return Papa.parse<T>(text, { header: true, skipEmptyLines: true }).data
}

type YearBundle = { annual: AnnualRow[]; yearly: YearlyRow[] }

function AllocationsPage() {
  const [selectedYear, setSelectedYear] = useState<string>(HISTORY_YEARS[0].year)
  const [annualRows, setAnnualRows] = useState<AnnualRow[]>([])
  const [yearlyRows, setYearlyRows] = useState<YearlyRow[]>([])
  const [yearMissing, setYearMissing] = useState(false)
  const [allYearsData, setAllYearsData] = useState<Map<string, YearBundle>>(new Map())
  const [selectedRso, setSelectedRso] = useState<string>('')
  const [chartMode, setChartMode] = useState<ChartMode>('bar')
  const [datasetMode, setDatasetMode] = useState<DatasetMode>('combined')
  const [selectedCommittee, setSelectedCommittee] = useState<Committee>('sgfc')
  const [topCount, setTopCount] = useState(25)
  const [showAllRsos, setShowAllRsos] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('funded')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const entry = HISTORY_YEARS.find((y) => y.year === selectedYear)
    if (!entry) {
      setAnnualRows([])
      setYearlyRows([])
      setYearMissing(true)
      setLoading(false)
      return
    }
    let cancelled = false
    async function loadData() {
      setLoading(true)
      setYearMissing(false)
      const [annualParsed, yearlyParsed] = await Promise.all([
        fetchCsvRows<AnnualRow>(entry!.annualPath),
        fetchCsvRows<YearlyRow>(entry!.yearlyPath),
      ])
      if (cancelled) return
      if (annualParsed === null && yearlyParsed === null) {
        setAnnualRows([])
        setYearlyRows([])
        setYearMissing(true)
      } else {
        setAnnualRows(annualParsed ?? [])
        setYearlyRows(yearlyParsed ?? [])
        setYearMissing(false)
      }
      setLoading(false)
    }

    void loadData()
    return () => {
      cancelled = true
    }
  }, [selectedYear])

  useEffect(() => {
    let cancelled = false
    async function loadAllYears() {
      const entries = await Promise.all(
        HISTORY_YEARS.map(async (entry) => {
          const [annual, yearly] = await Promise.all([
            fetchCsvRows<AnnualRow>(entry.annualPath),
            fetchCsvRows<YearlyRow>(entry.yearlyPath),
          ])
          if (annual === null && yearly === null) return null
          return [
            entry.year,
            { annual: annual ?? [], yearly: yearly ?? [] },
          ] as [string, YearBundle]
        }),
      )
      if (cancelled) return
      const map = new Map<string, YearBundle>()
      for (const e of entries) if (e) map.set(e[0], e[1])
      setAllYearsData(map)
    }
    void loadAllYears()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredAnnualRows = useMemo(
    () => annualRows.filter((row) => row.Committee === selectedCommittee),
    [annualRows, selectedCommittee],
  )
  const filteredYearlyRows = useMemo(
    () => yearlyRows.filter((row) => row.Committee === selectedCommittee),
    [yearlyRows, selectedCommittee],
  )
  const stream = STREAMS[selectedCommittee]
  const hasYearlyStream = stream.yearlyLabel !== null
  const hasTypeBreakdown = selectedCommittee === 'sgfc'

  useEffect(() => {
    if (!hasYearlyStream && datasetMode !== 'annual') {
      setDatasetMode('annual')
    }
    if (!hasTypeBreakdown && chartMode === 'donut') {
      setChartMode('bar')
    }
  }, [hasYearlyStream, hasTypeBreakdown, datasetMode, chartMode])

  const totals = useMemo(() => {
    const annual = filteredAnnualRows.reduce(
      (sum, row) => sum + (Number.parseFloat(row['Final Allocation'] || '0') || 0),
      0,
    )
    const yearly = filteredYearlyRows.reduce(
      (sum, row) => sum + (Number.parseFloat(row['Final Allocation'] || '0') || 0),
      0,
    )
    return { annual, yearly, combined: annual + yearly }
  }, [filteredAnnualRows, filteredYearlyRows])

  const yearlyByType = useMemo(() => {
    const bucket = new Map<string, number>()
    for (const row of filteredYearlyRows) {
      const type = (row.Type || 'Unspecified').trim() || 'Unspecified'
      const value = Number.parseFloat(row['Final Allocation'] || '0') || 0
      bucket.set(type, (bucket.get(type) ?? 0) + value)
    }
    return Array.from(bucket.entries()).sort((a, b) => b[1] - a[1])
  }, [filteredYearlyRows])

  const activeTotals = datasetMode === 'combined' ? totals.combined : datasetMode === 'annual' ? totals.annual : totals.yearly

  const tableRows = useMemo<RsoTableRow[]>(() => {
    const annualFundedMap = new Map<string, number>()
    const yearlyRequestedMap = new Map<string, number>()
    const yearlyFundedMap = new Map<string, number>()
    const names = new Set<string>()

    for (const row of filteredAnnualRows) {
      const name = row['RSO Name']?.trim()
      if (!name) continue
      names.add(name)
      annualFundedMap.set(
        name,
        (annualFundedMap.get(name) ?? 0) + (Number.parseFloat(row['Final Allocation'] || '0') || 0),
      )
    }

    for (const row of filteredYearlyRows) {
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
  }, [filteredAnnualRows, filteredYearlyRows])

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

  const mainChartData = useMemo(() => {
    const effectiveTopCount = showAllRsos ? filteredAndSortedRows.length : topCount
    const topRows = filteredAndSortedRows.slice(0, effectiveTopCount)
    const names = topRows.map((row) => row.name)
    const annualValues = topRows.map((row) => row.annualFunded)
    const yearlyValues = topRows.map((row) => row.yearlyFunded)
    const totalValues = topRows.map((row) => row.totalFunded)
    const activeValues =
      datasetMode === 'combined' ? totalValues : datasetMode === 'annual' ? annualValues : yearlyValues
    const activeLabel =
      datasetMode === 'combined'
        ? `${stream.annualLabel} + ${stream.yearlyLabel ?? ''}`
        : datasetMode === 'annual'
          ? stream.annualLabel
          : stream.yearlyLabel ?? ''

    const topTypes = yearlyByType.slice(0, 8)
    const remaining = yearlyByType.slice(8).reduce((sum, [, value]) => sum + value, 0)
    const donutData: { id: number; value: number; label: string }[] = topTypes.map(
      ([type, value], idx) => ({ id: idx, value, label: type }),
    )
    if (remaining > 0) {
      donutData.push({ id: donutData.length, value: remaining, label: 'Other' })
    }

    return { names, annualValues, yearlyValues, activeValues, activeLabel, donutData }
  }, [filteredAndSortedRows, topCount, showAllRsos, datasetMode, yearlyByType, stream])

  const displayedTableRows = useMemo(
    () => filteredAndSortedRows.slice(0, showAllRsos ? filteredAndSortedRows.length : topCount),
    [filteredAndSortedRows, topCount, showAllRsos],
  )

  const yoyTotals = useMemo(() => {
    return HISTORY_YEARS.map(({ year }) => {
      const bundle = allYearsData.get(year)
      if (!bundle) return { year, annual: 0, yearly: 0, combined: 0, available: false }
      const annual = bundle.annual
        .filter((row) => row.Committee === selectedCommittee)
        .reduce(
          (sum, row) => sum + (Number.parseFloat(row['Final Allocation'] || '0') || 0),
          0,
        )
      const yearly = bundle.yearly
        .filter((row) => row.Committee === selectedCommittee)
        .reduce(
          (sum, row) => sum + (Number.parseFloat(row['Final Allocation'] || '0') || 0),
          0,
        )
      return { year, annual, yearly, combined: annual + yearly, available: true }
    })
  }, [allYearsData, selectedCommittee])

  const yoyChart = useMemo(() => {
    const available = yoyTotals.filter((row) => row.available)
    return {
      years: available.map((row) => row.year),
      annual: available.map((row) => row.annual),
      yearly: available.map((row) => row.yearly),
    }
  }, [yoyTotals])

  const spotlightRsoOptions = useMemo(() => {
    const names = new Set<string>()
    for (const [, bundle] of allYearsData) {
      for (const row of bundle.annual) {
        if (row.Committee !== selectedCommittee) continue
        const name = row['RSO Name']?.trim()
        if (name) names.add(name)
      }
      for (const row of bundle.yearly) {
        if (row.Committee !== selectedCommittee) continue
        const name = row['RSO Name']?.trim()
        if (name) names.add(name)
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b))
  }, [allYearsData, selectedCommittee])

  useEffect(() => {
    if (selectedRso && !spotlightRsoOptions.includes(selectedRso)) {
      setSelectedRso('')
    }
  }, [spotlightRsoOptions, selectedRso])

  const spotlightByYear = useMemo(() => {
    if (!selectedRso) return []
    return HISTORY_YEARS.map(({ year }) => {
      const bundle = allYearsData.get(year)
      if (!bundle) {
        return { year, available: false, annual: 0, yearly: 0, events: [] as YearlyRow[] }
      }
      const annual = bundle.annual
        .filter((row) => row.Committee === selectedCommittee && row['RSO Name']?.trim() === selectedRso)
        .reduce(
          (sum, row) => sum + (Number.parseFloat(row['Final Allocation'] || '0') || 0),
          0,
        )
      const events = bundle.yearly.filter(
        (row) => row.Committee === selectedCommittee && row['RSO Name']?.trim() === selectedRso,
      )
      const yearly = events.reduce(
        (sum, row) => sum + (Number.parseFloat(row['Final Allocation'] || '0') || 0),
        0,
      )
      return { year, available: true, annual, yearly, events }
    })
  }, [allYearsData, selectedRso, selectedCommittee])

  const specialtyCards = useMemo(() => {
    return COMMITTEES.filter((c) => c !== selectedCommittee).map((code) => {
      const cStream = STREAMS[code]
      const annualForC = annualRows.filter((row) => row.Committee === code)
      const yearlyForC = yearlyRows.filter((row) => row.Committee === code)
      const annualSum = annualForC.reduce(
        (sum, row) => sum + (Number.parseFloat(row['Final Allocation'] || '0') || 0),
        0,
      )
      const yearlySum = yearlyForC.reduce(
        (sum, row) => sum + (Number.parseFloat(row['Final Allocation'] || '0') || 0),
        0,
      )
      const perRso = new Map<string, number>()
      for (const row of annualForC) {
        const name = row['RSO Name']?.trim()
        if (!name) continue
        perRso.set(name, (perRso.get(name) ?? 0) + (Number.parseFloat(row['Final Allocation'] || '0') || 0))
      }
      for (const row of yearlyForC) {
        const name = row['RSO Name']?.trim()
        if (!name) continue
        perRso.set(name, (perRso.get(name) ?? 0) + (Number.parseFloat(row['Final Allocation'] || '0') || 0))
      }
      const topRsos = Array.from(perRso.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
      return {
        code,
        name: COMMITTEE_LABELS[code],
        stream: cStream,
        annualSum,
        yearlySum,
        rsoCount: perRso.size,
        topRsos,
      }
    })
  }, [annualRows, yearlyRows, selectedCommittee])

  const spotlightChart = useMemo(() => {
    const available = spotlightByYear.filter((row) => row.available)
    return {
      years: available.map((row) => row.year),
      annual: available.map((row) => row.annual),
      yearly: available.map((row) => row.yearly),
    }
  }, [spotlightByYear])

  return (
    <>
      <section className="hero hero-allocations">
        <div className="hero-overlay">
          <div className="alloc-topbar">
            <p>USG Allocation Dashboard</p>
            <div className="alloc-topbar-actions">
              <button type="button">Export CSV</button>
            </div>
          </div>
          <h2>{COMMITTEE_LABELS[selectedCommittee]}</h2>
          <p>
            {hasYearlyStream
              ? `${stream.annualLabel} allocations plus ${stream.yearlyLabel?.toLowerCase()} funding for ${selectedYear}.`
              : `${stream.annualLabel} allocations for ${selectedYear}. This committee operates on a single stream.`}
          </p>
          <div className="stats">
            <article>
              <h3>{stream.annualLabel} · {selectedYear}</h3>
              <p>{CURRENCY.format(totals.annual)}</p>
            </article>
            {hasYearlyStream ? (
              <>
                <article>
                  <h3>{stream.yearlyLabel} · {selectedYear}</h3>
                  <p>{CURRENCY.format(totals.yearly)}</p>
                </article>
                <article>
                  <h3>{COMMITTEE_LABELS[selectedCommittee].split(' ')[0]} Total · {selectedYear}</h3>
                  <p>{CURRENCY.format(totals.combined)}</p>
                </article>
              </>
            ) : null}
          </div>
        </div>
      </section>
      <main className="content container">
        <section className="panel year-picker-row">
          <label>
            Academic Year
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
            >
              {HISTORY_YEARS.map((entry) => (
                <option key={entry.year} value={entry.year}>{entry.year}</option>
              ))}
            </select>
          </label>
          <p className="muted">
            Switch the year to re-render the dashboard with that year's published allocations.
          </p>
        </section>

        {yearMissing && !loading ? (
          <section className="panel year-missing">
            <p>No data published for {selectedYear} yet. Add CSVs at <code>frontend/public/history/{selectedYear}/</code> and register the year in <code>HISTORY_YEARS</code>.</p>
          </section>
        ) : null}

        <section className="panel yoy-panel">
          <div className="yoy-header">
            <div>
              <h3>{COMMITTEE_LABELS[selectedCommittee]} — Year over Year</h3>
              <p className="muted">
                {hasYearlyStream
                  ? `${stream.annualLabel} + ${stream.yearlyLabel} totals across all loaded academic years.`
                  : `${stream.annualLabel} totals across all loaded academic years.`}
              </p>
            </div>
          </div>
          <div className="yoy-body">
            <div className="chart-host" style={{ height: 240 }}>
              <BarChart
                xAxis={[{ scaleType: 'band', data: yoyChart.years }]}
                yAxis={[{ valueFormatter: (v: number) => CURRENCY.format(v) }]}
                series={
                  hasYearlyStream
                    ? [
                        { data: yoyChart.annual, label: stream.annualLabel, stack: 'yoy', color: ANNUAL_COLOR, valueFormatter: (v) => CURRENCY.format((v as number) ?? 0) },
                        { data: yoyChart.yearly, label: stream.yearlyLabel ?? '', stack: 'yoy', color: YEARLY_COLOR, valueFormatter: (v) => CURRENCY.format((v as number) ?? 0) },
                      ]
                    : [
                        { data: yoyChart.annual, label: stream.annualLabel, color: ANNUAL_COLOR, valueFormatter: (v) => CURRENCY.format((v as number) ?? 0) },
                      ]
                }
                height={240}
                margin={{ left: 70, right: 16, top: 16, bottom: 30 }}
              />
            </div>
            <div className="table-wrap">
              <table className="alloc-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>{stream.annualLabel}</th>
                    {hasYearlyStream ? <th>{stream.yearlyLabel}</th> : null}
                    {hasYearlyStream ? <th>Total</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {yoyTotals.map((row) => (
                    <tr key={row.year}>
                      <td>{row.year}</td>
                      <td>{row.available ? CURRENCY.format(row.annual) : '—'}</td>
                      {hasYearlyStream ? (
                        <td>{row.available ? CURRENCY.format(row.yearly) : '—'}</td>
                      ) : null}
                      {hasYearlyStream ? (
                        <td>{row.available ? CURRENCY.format(row.combined) : '—'}</td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="panel controls">
          <h3>Dashboard Controls</h3>
          <div className="control-grid">
            <label>
              Primary committee
              <select
                value={selectedCommittee}
                onChange={(event) =>
                  setSelectedCommittee(event.target.value as Committee)
                }
              >
                {COMMITTEES.map((code) => (
                  <option key={code} value={code}>
                    {COMMITTEE_LABELS[code]}
                  </option>
                ))}
              </select>
            </label>
            {hasYearlyStream ? (
              <label>
                Dataset
                <select value={datasetMode} onChange={(event) => setDatasetMode(event.target.value as DatasetMode)}>
                  <option value="combined">Combined ({stream.annualLabel} + {stream.yearlyLabel})</option>
                  <option value="annual">{stream.annualLabel} only</option>
                  <option value="yearly">{stream.yearlyLabel} only</option>
                </select>
              </label>
            ) : null}
            <label>
              Chart Mode
              <select value={chartMode} onChange={(event) => setChartMode(event.target.value as ChartMode)}>
                <option value="bar">Ranked Horizontal Bar</option>
                {hasYearlyStream ? (
                  <option value="stacked">Stacked {stream.annualLabel} + {stream.yearlyLabel} Bars</option>
                ) : null}
                {hasTypeBreakdown ? <option value="donut">Donut (Request Type Mix)</option> : null}
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
          ) : chartMode === 'donut' ? (
            <>
              <h3 className="chart-title">{stream.yearlyLabel} Allocation Mix by Request Type</h3>
              <div className="chart-host" style={{ height: 520 }}>
                <PieChart
                  series={[
                    {
                      data: mainChartData.donutData,
                      innerRadius: 100,
                      outerRadius: 200,
                      paddingAngle: 1.5,
                      cornerRadius: 4,
                      arcLabel: (item) => `${item.label}`,
                      arcLabelMinAngle: 18,
                      valueFormatter: (item) => CURRENCY.format(item.value),
                    },
                  ]}
                  colors={PIE_COLORS}
                  height={520}
                />
              </div>
            </>
          ) : chartMode === 'stacked' ? (
            <>
              <h3 className="chart-title">{stream.annualLabel} vs {stream.yearlyLabel} Funded by RSO</h3>
              <div className="chart-host" style={{ height: 520 }}>
                <BarChart
                  xAxis={[{ scaleType: 'band', data: mainChartData.names, tickLabelStyle: { angle: -35, textAnchor: 'end', fontSize: 11 } }]}
                  yAxis={[{ valueFormatter: (v: number) => CURRENCY.format(v), label: 'Funded Amount (USD)' }]}
                  series={[
                    { data: mainChartData.annualValues, label: `${stream.annualLabel} Funded`, stack: 'rso', color: ANNUAL_COLOR, valueFormatter: (v) => CURRENCY.format((v as number) ?? 0) },
                    { data: mainChartData.yearlyValues, label: `${stream.yearlyLabel} Funded`, stack: 'rso', color: YEARLY_COLOR, valueFormatter: (v) => CURRENCY.format((v as number) ?? 0) },
                  ]}
                  height={520}
                  margin={{ left: 80, right: 16, top: 24, bottom: 100 }}
                />
              </div>
            </>
          ) : (
            <>
              <h3 className="chart-title">Top RSOs by {mainChartData.activeLabel} Funded</h3>
              <div className="chart-host" style={{ height: Math.max(520, mainChartData.names.length * 22) }}>
                <BarChart
                  layout="horizontal"
                  yAxis={[{ scaleType: 'band', data: mainChartData.names, tickLabelStyle: { fontSize: 11 } }]}
                  xAxis={[{ valueFormatter: (v: number) => CURRENCY.format(v), label: 'Funded Amount (USD)' }]}
                  series={[
                    {
                      data: mainChartData.activeValues,
                      label: `${mainChartData.activeLabel} Funded`,
                      color: ANNUAL_COLOR,
                      valueFormatter: (v) => CURRENCY.format((v as number) ?? 0),
                    },
                  ]}
                  height={Math.max(520, mainChartData.names.length * 22)}
                  margin={{ left: 220, right: 24, top: 24, bottom: 50 }}
                />
              </div>
            </>
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
                  {hasYearlyStream ? (
                    <th onClick={() => handleHeaderSort('requested')} className="sortable">{stream.yearlyLabel} Requested{sortIndicator('requested')}</th>
                  ) : null}
                  {hasYearlyStream ? (
                    <th onClick={() => handleHeaderSort('yearly')} className="sortable">{stream.yearlyLabel} Funded{sortIndicator('yearly')}</th>
                  ) : null}
                  <th onClick={() => handleHeaderSort('annual')} className="sortable">{stream.annualLabel} Funded{sortIndicator('annual')}</th>
                  <th onClick={() => handleHeaderSort('funded')} className="sortable">Total Funded{sortIndicator('funded')}</th>
                </tr>
              </thead>
              <tbody>
                {displayedTableRows.map((row) => (
                  <tr key={row.name}>
                    <td>{row.rank}</td>
                    <td>{row.name}</td>
                    {hasYearlyStream ? <td>{CURRENCY.format(row.yearlyRequested)}</td> : null}
                    {hasYearlyStream ? <td>{CURRENCY.format(row.yearlyFunded)}</td> : null}
                    <td>{CURRENCY.format(row.annualFunded)}</td>
                    <td>{CURRENCY.format(row.totalFunded)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel spotlight-panel">
          <div className="spotlight-header">
            <div>
              <h3>RSO Spotlight</h3>
              <p className="muted">Pick an RSO to see its allocation history across all loaded years.</p>
            </div>
            <label className="spotlight-picker">
              RSO
              <select
                value={selectedRso}
                onChange={(event) => setSelectedRso(event.target.value)}
                disabled={spotlightRsoOptions.length === 0}
              >
                <option value="">— Select an RSO —</option>
                {spotlightRsoOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>
          </div>

          {selectedRso ? (
            <>
              <h4 className="chart-title">{selectedRso} — Funding Over Years</h4>
              <div className="chart-host" style={{ height: 360 }}>
                <BarChart
                  xAxis={[{ scaleType: 'band', data: spotlightChart.years }]}
                  yAxis={[{ valueFormatter: (v: number) => CURRENCY.format(v), label: 'Funded Amount (USD)' }]}
                  series={
                    hasYearlyStream
                      ? [
                          { data: spotlightChart.annual, label: `${stream.annualLabel} Funded`, stack: 'spot', color: ANNUAL_COLOR, valueFormatter: (v) => CURRENCY.format((v as number) ?? 0) },
                          { data: spotlightChart.yearly, label: `${stream.yearlyLabel} Funded`, stack: 'spot', color: YEARLY_COLOR, valueFormatter: (v) => CURRENCY.format((v as number) ?? 0) },
                        ]
                      : [
                          { data: spotlightChart.annual, label: `${stream.annualLabel} Funded`, color: ANNUAL_COLOR, valueFormatter: (v) => CURRENCY.format((v as number) ?? 0) },
                        ]
                  }
                  height={360}
                  margin={{ left: 80, right: 24, top: 24, bottom: 50 }}
                />
              </div>
              <div className="table-wrap">
                <table className="alloc-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>{stream.annualLabel} Funded</th>
                      {hasYearlyStream ? <th>{stream.yearlyLabel} Funded</th> : null}
                      {hasYearlyStream ? <th>Total</th> : null}
                      {hasYearlyStream ? <th>{stream.yearlyLabel} Events</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {spotlightByYear.map((row) => (
                      <tr key={row.year}>
                        <td>{row.year}</td>
                        <td>{row.available ? CURRENCY.format(row.annual) : '—'}</td>
                        {hasYearlyStream ? (
                          <td>{row.available ? CURRENCY.format(row.yearly) : '—'}</td>
                        ) : null}
                        {hasYearlyStream ? (
                          <td>{row.available ? CURRENCY.format(row.annual + row.yearly) : '—'}</td>
                        ) : null}
                        {hasYearlyStream ? (
                          <td>
                            {row.available && row.events.length > 0 ? (
                              <ul className="event-list">
                                {row.events.map((event, idx) => (
                                  <li key={`${row.year}-${idx}`}>
                                    <strong>{event['Request Description'] || '(no description)'}</strong>
                                    {hasTypeBreakdown ? (
                                      <span className="muted"> · {event.Type || 'Unspecified'}</span>
                                    ) : null}
                                    <span> — req {CURRENCY.format(Number.parseFloat(event.Requested || '0') || 0)}, funded {CURRENCY.format(Number.parseFloat(event['Final Allocation'] || '0') || 0)}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : row.available ? (
                              <span className="muted">No events</span>
                            ) : (
                              <span className="muted">No data</span>
                            )}
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="muted">
              {spotlightRsoOptions.length === 0
                ? 'Loading RSO list…'
                : 'Pick an RSO to see its allocation history across years.'}
            </p>
          )}
        </section>

        {hasTypeBreakdown ? (
          <section className="panel types">
            <h3>{stream.yearlyLabel} Allocation by Request Type</h3>
            <div className="type-grid">
              {yearlyByType.map(([type, value]) => (
                <article key={type}>
                  <h4>{type}</h4>
                  <p>{CURRENCY.format(value)}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="panel specialty-panel">
          <div className="specialty-header">
            <h3>Other Funding Streams · {selectedYear}</h3>
            <p className="muted">
              Each committee operates its own pool. Click a card to make it the primary view.
            </p>
          </div>
          <div className="specialty-grid">
            {specialtyCards.map((card) => {
              const total = card.annualSum + card.yearlySum
              const hasYearly = card.stream.yearlyLabel !== null
              return (
                <button
                  type="button"
                  key={card.code}
                  className="specialty-card"
                  onClick={() => setSelectedCommittee(card.code)}
                >
                  <div className="specialty-card-head">
                    <span className="specialty-code">{card.code.toUpperCase()}</span>
                    <span className="specialty-total">{CURRENCY.format(total)}</span>
                  </div>
                  <h4>{card.name}</h4>
                  <dl className="specialty-stats">
                    <div>
                      <dt>{card.stream.annualLabel}</dt>
                      <dd>{CURRENCY.format(card.annualSum)}</dd>
                    </div>
                    {hasYearly ? (
                      <div>
                        <dt>{card.stream.yearlyLabel}</dt>
                        <dd>{CURRENCY.format(card.yearlySum)}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt>RSOs</dt>
                      <dd>{card.rsoCount}</dd>
                    </div>
                  </dl>
                  {card.topRsos.length > 0 ? (
                    <ol className="specialty-top">
                      {card.topRsos.map(([name, value]) => (
                        <li key={name}>
                          <span className="specialty-top-name">{name}</span>
                          <span className="specialty-top-value">{CURRENCY.format(value)}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="muted">No data for {selectedYear}.</p>
                  )}
                  <span className="specialty-cta">View this committee →</span>
                </button>
              )
            })}
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
