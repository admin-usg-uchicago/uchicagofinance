import { useMemo, useState } from 'react'
import {
  COMMITTEE_LABELS,
  COMMITTEE_SHORT,
  allRsoNames,
  perRso,
  rsoTotals,
  type Allocations,
  type Committee,
} from '../data/stats'
import { currency, percent } from '../data/format'

type Props = {
  data: Allocations
  selectedCommittee: Committee | null
}

export function RsoCompare({ data, selectedCommittee }: Props) {
  const totals = useMemo(() => rsoTotals(data), [data])

  const names = useMemo(() => {
    const all = allRsoNames(data)
    if (!selectedCommittee) return all
    return all.filter((n) => totals.get(n)?.committee === selectedCommittee)
  }, [data, selectedCommittee, totals])

  const [left, setLeft] = useState<string>('')
  const [right, setRight] = useState<string>('')

  const leftDetail = left ? perRso(data, left) : null
  const rightDetail = right ? perRso(data, right) : null

  return (
    <section
      className="rso-compare"
      id="rso-compare"
      aria-labelledby="rso-compare-heading"
    >
      <header className="section-header">
        <div className="section-chapter" aria-hidden>
          <span>VI</span>
        </div>
        <p className="section-eyebrow">Side by side</p>
        <h2 id="rso-compare-heading" className="section-title">
          Compare two RSOs
        </h2>
        <p className="section-lede">
          Pick any two organizations to see their asks, fundings, and per-event
          decisions next to each other.
        </p>
      </header>

      <div className="compare-pickers">
        <Picker
          label="RSO A"
          names={names}
          value={left}
          onChange={setLeft}
          otherValue={right}
        />
        <Picker
          label="RSO B"
          names={names}
          value={right}
          onChange={setRight}
          otherValue={left}
        />
      </div>

      <div className="compare-grid">
        <CompareCard detail={leftDetail} side="A" />
        <CompareCard detail={rightDetail} side="B" />
      </div>
    </section>
  )
}

function Picker({
  label,
  names,
  value,
  onChange,
  otherValue,
}: {
  label: string
  names: string[]
  value: string
  onChange: (v: string) => void
  otherValue: string
}) {
  return (
    <label className="compare-picker">
      <span className="compare-picker-label">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="compare-picker-select"
      >
        <option value="">— Select an RSO —</option>
        {names.map((n) => (
          <option key={n} value={n} disabled={n === otherValue}>
            {n}
          </option>
        ))}
      </select>
    </label>
  )
}

function CompareCard({
  detail,
  side,
}: {
  detail: ReturnType<typeof perRso>
  side: 'A' | 'B'
}) {
  if (!detail) {
    return (
      <article className="compare-card compare-card--empty">
        <p>Pick an RSO to fill side {side}.</p>
      </article>
    )
  }

  const totalRequested = detail.requests.reduce((s, r) => s + r.requested, 0)
  const ratio = totalRequested > 0 ? detail.totals.total / totalRequested : 0

  return (
    <article className="compare-card">
      <header className="compare-card-head">
        <span className="compare-card-chip">
          {COMMITTEE_SHORT[detail.committee]}
        </span>
        <h3 className="compare-card-name">{detail.rso}</h3>
        <p className="compare-card-committee">
          {COMMITTEE_LABELS[detail.committee]}
        </p>
      </header>

      <div className="compare-card-totals">
        <div>
          <span className="compare-card-total-label">Requested</span>
          <span className="compare-card-total-value">
            {currency(totalRequested)}
          </span>
        </div>
        <div>
          <span className="compare-card-total-label">Funded</span>
          <span className="compare-card-total-value strong">
            {currency(detail.totals.total)}
          </span>
        </div>
        <div>
          <span className="compare-card-total-label">Funded rate</span>
          <span className="compare-card-total-value">{percent(ratio)}</span>
        </div>
        <div>
          <span className="compare-card-total-label">
            Rank in {COMMITTEE_SHORT[detail.committee]}
          </span>
          <span className="compare-card-total-value">
            {detail.rankInCommittee > 0
              ? `#${detail.rankInCommittee} of ${detail.committeeSize}`
              : '—'}
          </span>
        </div>
      </div>

      {detail.requests.length > 0 && (
        <table className="compare-card-table">
          <thead>
            <tr>
              <th>Kind</th>
              <th>Description</th>
              <th className="num">Requested</th>
              <th className="num">Funded</th>
            </tr>
          </thead>
          <tbody>
            {detail.requests.map((r, i) => (
              <tr key={i}>
                <td>
                  <span className="rso-request-kind">{r.kind}</span>
                </td>
                <td>
                  {r.kind === 'recurring'
                    ? r.description || '—'
                    : 'Annual allocation'}
                </td>
                <td className="num">{currency(r.requested)}</td>
                <td className="num strong">{currency(r.final)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </article>
  )
}
