import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import {
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

function matchesStatus(r: RsoFunding, status: StatusFilter): boolean {
  if (status === 'all') return true
  if (r.requested <= 0) return false
  if (status === 'fully') return r.funded >= r.requested
  if (status === 'partial') return r.funded > 0 && r.funded < r.requested
  if (status === 'denied') return r.funded === 0
  return true
}

export function FundingSection({ data, selectedCommittee, status, topN }: Props) {
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

  const biggestCuts = useMemo(
    () =>
      [...filtered]
        .sort((a, b) => b.gap - a.gap)
        .slice(0, topN)
        .filter((r) => r.gap > 0),
    [filtered, topN],
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
          <span>III</span>
        </div>
        <p className="section-eyebrow">Requested vs funded</p>
        <h2 id="funding-heading" className="section-title">
          Asked for, given
        </h2>
        <p className="section-lede">
          Every dot is an RSO. The diagonal line is full funding. Distance below
          the line is the gap between what was requested and what was approved.
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
          <h3>Biggest cuts</h3>
          <p>
            Top {biggestCuts.length} {selectedCommittee ? `${COMMITTEE_SHORT[selectedCommittee]} ` : ''}
            RSOs by gap between requested and funded.
          </p>
        </header>

        {biggestCuts.length === 0 ? (
          <p className="funding-cuts-empty">
            Every RSO in this view received its full request.
          </p>
        ) : (
          <DumbbellList rows={biggestCuts} />
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

function DumbbellList({ rows }: { rows: RsoFunding[] }) {
  const max = Math.max(1, ...rows.map((r) => r.requested))
  const pct = (v: number) => `${(v / max) * 100}%`
  return (
    <ol className="dumbbell-list">
      {rows.map((r, i) => (
        <li key={r.rso} className="dumbbell-row">
          <span className="dumbbell-rank" aria-hidden>
            {i + 1}
          </span>
          <div className="dumbbell-meta">
            <span className="dumbbell-name" title={r.rso}>
              {r.rso}
            </span>
            <span className="dumbbell-chip">
              {COMMITTEE_SHORT[r.committee]}
            </span>
          </div>
          <div
            className="dumbbell-track"
            role="img"
            aria-label={`${r.rso}: requested ${currency(r.requested)}, funded ${currency(r.funded)}`}
          >
            <span
              className="dumbbell-line"
              style={{ left: pct(r.funded), width: pct(r.gap) }}
            />
            <span
              className="dumbbell-dot dumbbell-dot--funded"
              style={{ left: pct(r.funded) }}
            >
              <span className="dumbbell-tooltip">
                Got {currency(r.funded)}
              </span>
            </span>
            <span
              className="dumbbell-dot dumbbell-dot--requested"
              style={{ left: pct(r.requested) }}
            >
              <span className="dumbbell-tooltip">
                Asked {currency(r.requested)}
              </span>
            </span>
          </div>
          <div className="dumbbell-numbers">
            <span className="dumbbell-gap">−{currency(r.gap)}</span>
            <span className="dumbbell-ratio">{percent(r.ratio)} funded</span>
          </div>
        </li>
      ))}
    </ol>
  )
}
