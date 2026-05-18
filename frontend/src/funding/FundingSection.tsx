import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import {
  COMMITTEES,
  COMMITTEE_SHORT,
  rsoRequestedFunded,
  type Allocations,
  type Committee,
  type RsoFunding,
} from '../data/stats'
import type { StatusFilter } from '../controls/DashboardControls'
import { currency, currencyCompact, percent } from '../data/format'

type Props = {
  data: Allocations
  selectedCommittee: Committee | null
  status: StatusFilter
  topN: number
}

type CommitteeMedian = {
  committee: Committee
  median: number
  count: number
  min: number
  max: number
  total: number
  share: number
}

type FundedPoint = { committee: Committee; funded: number }

const median = (sortedAsc: number[]): number => {
  const n = sortedAsc.length
  if (n === 0) return 0
  const mid = Math.floor(n / 2)
  return n % 2 === 0 ? (sortedAsc[mid - 1] + sortedAsc[mid]) / 2 : sortedAsc[mid]
}

// Per-committee shades — five clearly-stepped values in the maroon family,
// spanning very-dark maroon → brick → crimson → coral → rose.
const COMMITTEE_COLORS: Record<Committee, string> = {
  scf: '#3d0606',
  sgfc: '#6e0e0e',
  pcc: '#a52525',
  cat: '#d04848',
  csf: '#ec8a8a',
}

function matchesStatus(r: RsoFunding, status: StatusFilter): boolean {
  if (status === 'all') return true
  if (r.requested <= 0) return false
  if (status === 'fully') return r.funded >= r.requested
  if (status === 'partial') return r.funded > 0 && r.funded < r.requested
  if (status === 'denied') return r.funded === 0
  return true
}

export function FundingSection({ data, selectedCommittee, status }: Props) {
  const all = useMemo(() => rsoRequestedFunded(data), [data])
  const [hovered, setHovered] = useState<RsoFunding | null>(null)

  const filtered = useMemo(() => {
    let rows = all
    if (selectedCommittee) {
      rows = rows.filter((r) => r.committee === selectedCommittee)
    }
    rows = rows.filter((r) => matchesStatus(r, status))
    return rows
  }, [all, selectedCommittee, status])

  const aggregate = useMemo(() => {
    const req = filtered.reduce((s, r) => s + r.requested, 0)
    const fund = filtered.reduce((s, r) => s + r.funded, 0)
    return {
      requested: req,
      funded: fund,
      ratio: req > 0 ? fund / req : 0,
      rsos: filtered.length,
    }
  }, [filtered])

  // Per-committee stats of funded amounts across all funded allocations
  // (always all 5 committees, not affected by the committee pill filter).
  const committeeMedians = useMemo<CommitteeMedian[]>(() => {
    const funded = all.filter((r) => r.funded > 0)
    const grandTotal = funded.reduce((s, r) => s + r.funded, 0) || 1
    const out: CommitteeMedian[] = []
    for (const c of COMMITTEES) {
      const amounts = funded
        .filter((r) => r.committee === c)
        .map((r) => r.funded)
        .sort((a, b) => a - b)
      if (amounts.length === 0) continue
      const total = amounts.reduce((s, v) => s + v, 0)
      out.push({
        committee: c,
        median: median(amounts),
        count: amounts.length,
        min: amounts[0],
        max: amounts[amounts.length - 1],
        total,
        share: total / grandTotal,
      })
    }
    return out
  }, [all])

  const allFunded = useMemo<FundedPoint[]>(
    () =>
      all
        .filter((r) => r.funded > 0)
        .map((r) => ({ committee: r.committee, funded: r.funded })),
    [all],
  )

  return (
    <section
      id="funding"
      className="funding"
      aria-labelledby="funding-heading"
    >
      <motion.header
        className="section-header"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <div className="section-chapter" aria-hidden>
          <span>IV</span>
        </div>
        <p className="section-eyebrow">Requested v. funded</p>
        <h2 id="funding-heading" className="section-title">
          Requested v. Funded
        </h2>
        <p className="section-lede">
          Every dot is an RSO. The diagonal line is full funding — dots closer
          to it received a larger share of what they asked for.
        </p>
      </motion.header>

      <div className="funding-summary">
        <SummaryStat label="RSOs shown" value={aggregate.rsos.toLocaleString()} />
        <SummaryStat
          label="Requested"
          value={currencyCompact(aggregate.requested)}
        />
        <SummaryStat
          label="Funded"
          value={currencyCompact(aggregate.funded)}
        />
        <SummaryStat
          label="Approval rate"
          value={percent(aggregate.ratio)}
          accent
        />
      </div>

      <div className="funding-chart-wrap">
        <ScatterChart
          points={filtered}
          highlight={selectedCommittee}
          onHover={setHovered}
        />
        <HoverPanel point={hovered} />
      </div>

      <div className="funding-cuts">
        <header className="funding-cuts-head">
          <h3>Median allocation by committee</h3>
          <p>
            Each committee&rsquo;s median funded amount, plotted against every
            funded allocation in {data.annual.length + data.recurring.length > 0 ? 'this cycle' : 'the cycle'}.
          </p>
        </header>

        {committeeMedians.length === 0 || allFunded.length === 0 ? (
          <p className="funding-cuts-empty">
            No funded allocations in this cycle yet.
          </p>
        ) : (
          <>
            <MedianNumberLine
              funded={allFunded}
              medians={committeeMedians}
              highlight={selectedCommittee}
            />
            <CommitteeStatsGrid
              medians={committeeMedians}
              highlight={selectedCommittee}
            />
          </>
        )}
      </div>
    </section>
  )
}

function SummaryStat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className={`funding-stat${accent ? ' funding-stat--accent' : ''}`}>
      <span className="funding-stat-value">{value}</span>
      <span className="funding-stat-label">{label}</span>
    </div>
  )
}

const SCATTER_W = 720
const SCATTER_H = 460
const MARGIN = { l: 64, r: 24, t: 24, b: 56 }

function ScatterChart({
  points,
  highlight,
  onHover,
}: {
  points: RsoFunding[]
  highlight: Committee | null
  onHover: (p: RsoFunding | null) => void
}) {
  const max = useMemo(() => {
    let m = 0
    for (const p of points) {
      if (p.requested > m) m = p.requested
      if (p.funded > m) m = p.funded
    }
    return m || 1
  }, [points])

  const innerW = SCATTER_W - MARGIN.l - MARGIN.r
  const innerH = SCATTER_H - MARGIN.t - MARGIN.b
  const x = (v: number) => MARGIN.l + (v / max) * innerW
  const y = (v: number) => MARGIN.t + innerH - (v / max) * innerH
  const ticks = [0, 0.25, 0.5, 0.75, 1.0].map((t) => t * max)

  return (
    <svg
      className="funding-chart"
      viewBox={`0 0 ${SCATTER_W} ${SCATTER_H}`}
      role="img"
      aria-label="Scatter plot of requested versus funded amounts per RSO"
      onMouseLeave={() => onHover(null)}
    >
      {ticks.map((t, i) => (
        <g key={i} className="funding-grid">
          <line x1={MARGIN.l} x2={MARGIN.l + innerW} y1={y(t)} y2={y(t)} />
          <line x1={x(t)} x2={x(t)} y1={MARGIN.t} y2={MARGIN.t + innerH} />
          <text
            className="funding-tick"
            x={MARGIN.l - 8}
            y={y(t) + 3}
            textAnchor="end"
          >
            {currencyCompact(t)}
          </text>
          <text
            className="funding-tick"
            x={x(t)}
            y={MARGIN.t + innerH + 18}
            textAnchor="middle"
          >
            {currencyCompact(t)}
          </text>
        </g>
      ))}

      <line
        className="funding-diagonal"
        x1={x(0)}
        y1={y(0)}
        x2={x(max)}
        y2={y(max)}
      />
      <text
        className="funding-diagonal-label"
        x={x(max) - 6}
        y={y(max) + 14}
        textAnchor="end"
      >
        100% funded
      </text>

      {points.map((p) => {
        const dim = highlight !== null && p.committee !== highlight
        return (
          <circle
            key={p.rso}
            className="funding-dot"
            cx={x(p.requested)}
            cy={y(p.funded)}
            r={dim ? 2.5 : 4}
            opacity={dim ? 0.08 : 0.55}
            onMouseEnter={() => onHover(p)}
          />
        )
      })}

      <text
        className="funding-axis-label"
        x={MARGIN.l + innerW / 2}
        y={SCATTER_H - 10}
        textAnchor="middle"
      >
        Requested
      </text>
      <text
        className="funding-axis-label"
        x={18}
        y={MARGIN.t + innerH / 2}
        transform={`rotate(-90 18 ${MARGIN.t + innerH / 2})`}
        textAnchor="middle"
      >
        Funded
      </text>
    </svg>
  )
}

function HoverPanel({ point }: { point: RsoFunding | null }) {
  return (
    <div className="funding-hover" aria-live="polite">
      {point ? (
        <>
          <div className="funding-hover-head">
            <span className="funding-hover-chip">
              {COMMITTEE_SHORT[point.committee]}
            </span>
            <span className="funding-hover-name">{point.rso}</span>
          </div>
          <div className="funding-hover-grid">
            <div>
              <span className="funding-hover-label">Requested</span>
              <span className="funding-hover-value">
                {currency(point.requested)}
              </span>
            </div>
            <div>
              <span className="funding-hover-label">Funded</span>
              <span className="funding-hover-value">
                {currency(point.funded)}
              </span>
            </div>
            <div>
              <span className="funding-hover-label">Approval rate</span>
              <span className="funding-hover-value">
                {percent(point.ratio)}
              </span>
            </div>
            <div>
              <span className="funding-hover-label">Gap</span>
              <span className="funding-hover-value">
                {point.gap > 0 ? `−${currency(point.gap)}` : currency(0)}
              </span>
            </div>
          </div>
        </>
      ) : (
        <p className="funding-hover-hint">
          Hover any dot to see the RSO and its decision.
        </p>
      )}
    </div>
  )
}

const NL_W = 880
const NL_H = 260
const NL_PAD = { l: 32, r: 32, t: 116, b: 56 }

function MedianNumberLine({
  funded,
  medians,
  highlight,
}: {
  funded: FundedPoint[]
  medians: CommitteeMedian[]
  highlight: Committee | null
}) {
  const innerW = NL_W - NL_PAD.l - NL_PAD.r
  const lineY = NL_H - NL_PAD.b
  const max = Math.max(
    1,
    ...funded.map((p) => p.funded),
    ...medians.map((m) => m.median),
  )

  // sqrt scale — funded allocations are heavily right-skewed, so a sqrt
  // transform spreads the low end and keeps medians visually distinguishable.
  const scale = (v: number) =>
    NL_PAD.l + (Math.sqrt(Math.max(0, v)) / Math.sqrt(max)) * innerW

  // "Nice" ticks at recognizable round dollar values across the visible range.
  const niceTicks = (lim: number): number[] => {
    const candidates = [0, 500, 1_000, 2_500, 5_000, 10_000, 25_000, 50_000, 100_000, 250_000, 500_000]
    return candidates.filter((t) => t <= lim)
  }
  const ticks = niceTicks(max)

  // Stack overlapping median labels into rows so they don't collide.
  const PILL_W = 92
  const PILL_H = 19
  const LABEL_GUARD = PILL_W + 10
  const sorted = [...medians].sort((a, b) => a.median - b.median)
  const placed: Array<CommitteeMedian & { cx: number; row: number }> = []
  for (const m of sorted) {
    const cx = scale(m.median)
    let row = 0
    while (placed.some((p) => p.row === row && Math.abs(p.cx - cx) < LABEL_GUARD)) {
      row += 1
    }
    placed.push({ ...m, cx, row })
  }
  const rowH = 24

  return (
    <svg
      className="numline"
      viewBox={`0 0 ${NL_W} ${NL_H}`}
      role="img"
      aria-label="Median funded allocation by committee, on a number line of all funded allocations"
    >
      {/* axis ticks */}
      {ticks.map((t, i) => (
        <g key={i} className="numline-tick">
          <line x1={scale(t)} x2={scale(t)} y1={lineY - 4} y2={lineY + 6} />
          <text x={scale(t)} y={lineY + 20} textAnchor="middle">
            {t === 0 ? '$0' : currencyCompact(t)}
          </text>
        </g>
      ))}

      {/* base axis */}
      <line
        className="numline-axis"
        x1={NL_PAD.l}
        x2={NL_W - NL_PAD.r}
        y1={lineY}
        y2={lineY}
      />

      {/* rug of every funded allocation, colored by committee */}
      {funded.map((p, i) => {
        const dim = highlight !== null && p.committee !== highlight
        return (
          <circle
            key={i}
            className="numline-rug"
            cx={scale(p.funded)}
            cy={lineY + 32}
            r={dim ? 1.6 : 2.6}
            fill={COMMITTEE_COLORS[p.committee]}
            opacity={dim ? 0.18 : 0.72}
          />
        )
      })}
      <text
        className="numline-rug-label"
        x={NL_PAD.l}
        y={lineY + 50}
      >
        Every funded allocation · colored by committee
      </text>

      {/* medians, lifted above the line */}
      {placed.map((m) => {
        const dim = highlight !== null && m.committee !== highlight
        const markerY = lineY - 22 - m.row * rowH
        const dotY = markerY + 6
        const color = COMMITTEE_COLORS[m.committee]
        return (
          <g
            key={m.committee}
            className={`numline-median${dim ? ' numline-median--dim' : ''}`}
          >
            <line
              className="numline-stem"
              x1={m.cx}
              x2={m.cx}
              y1={lineY}
              y2={dotY}
              stroke={color}
            />
            <circle
              className="numline-median-dot"
              cx={m.cx}
              cy={dotY}
              r={5}
              fill={color}
            />
            <g transform={`translate(${m.cx}, ${markerY})`}>
              <rect
                className="numline-pill"
                x={-PILL_W / 2}
                y={-PILL_H}
                width={PILL_W}
                height={PILL_H}
                rx={5}
                fill={color}
              />
              <text
                className="numline-pill-label"
                x={-PILL_W / 2 + 8}
                y={-PILL_H / 2 + 3.5}
                textAnchor="start"
              >
                {COMMITTEE_SHORT[m.committee]}
              </text>
              <text
                className="numline-pill-value"
                x={PILL_W / 2 - 8}
                y={-PILL_H / 2 + 3.5}
                textAnchor="end"
              >
                {currency(m.median)}
              </text>
            </g>
          </g>
        )
      })}

      {/* eyebrow above markers */}
      <text className="numline-eyebrow" x={NL_PAD.l} y={20}>
        Median funded allocation, per committee
      </text>
      <text className="numline-eyebrow-sub" x={NL_PAD.l} y={36}>
        sqrt scale — most allocations cluster under $5K
      </text>
    </svg>
  )
}

function CommitteeStatsGrid({
  medians,
  highlight,
}: {
  medians: CommitteeMedian[]
  highlight: Committee | null
}) {
  const ordered = [...medians].sort((a, b) => b.median - a.median)
  return (
    <ul className="cmstats">
      {ordered.map((m) => {
        const dim = highlight !== null && m.committee !== highlight
        const color = COMMITTEE_COLORS[m.committee]
        return (
          <li
            key={m.committee}
            className={`cmstats-card${dim ? ' cmstats-card--dim' : ''}`}
            style={{ borderTopColor: color }}
          >
            <div className="cmstats-head">
              <span className="cmstats-chip" style={{ background: color }}>
                {COMMITTEE_SHORT[m.committee]}
              </span>
              <span className="cmstats-rsos">
                {m.count} RSO{m.count === 1 ? '' : 's'}
              </span>
            </div>
            <div className="cmstats-median">
              <span className="cmstats-median-label">Median</span>
              <span className="cmstats-median-value">{currency(m.median)}</span>
            </div>
            <dl className="cmstats-detail">
              <div>
                <dt>Range</dt>
                <dd>
                  {currencyCompact(m.min)} &ndash; {currencyCompact(m.max)}
                </dd>
              </div>
              <div>
                <dt>Total funded</dt>
                <dd>{currencyCompact(m.total)}</dd>
              </div>
              <div>
                <dt>Share of pool</dt>
                <dd>{percent(m.share)}</dd>
              </div>
            </dl>
          </li>
        )
      })}
    </ul>
  )
}
