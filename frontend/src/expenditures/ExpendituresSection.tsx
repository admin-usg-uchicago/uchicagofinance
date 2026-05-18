import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import type { Allocations, ExpenditureRow } from '../data/stats'
import { currency, currencyCompact, integer, percent } from '../data/format'
import { TbdCard } from '../common/TbdCard'

type Props = { data: Allocations }

type DivisionFilter = string | 'all'

type DivisionTotal = {
  division: string
  total: number
  count: number
  share: number
}

export function ExpendituresSection({ data }: Props) {
  const rows = data.expenditures
  const [filter, setFilter] = useState<DivisionFilter>('all')

  const divisions = useMemo<DivisionTotal[]>(() => {
    const total = rows.reduce((s, r) => s + r.amount, 0) || 1
    const map = new Map<string, { total: number; count: number }>()
    for (const r of rows) {
      const entry = map.get(r.division) ?? { total: 0, count: 0 }
      entry.total += r.amount
      entry.count += 1
      map.set(r.division, entry)
    }
    return [...map.entries()]
      .map(([division, { total: t, count }]) => ({
        division,
        total: t,
        count,
        share: t / total,
      }))
      .sort((a, b) => b.total - a.total)
  }, [rows])

  const aggregate = useMemo(() => {
    const total = rows.reduce((s, r) => s + r.amount, 0)
    const categories = new Set(rows.map((r) => r.category))
    return {
      total,
      divisions: divisions.length,
      categories: categories.size,
      transactions: rows.length,
    }
  }, [rows, divisions])

  const visibleRows = useMemo(() => {
    const filtered = filter === 'all' ? rows : rows.filter((r) => r.division === filter)
    return [...filtered].sort((a, b) => b.amount - a.amount)
  }, [rows, filter])

  const visibleTotal = useMemo(
    () => visibleRows.reduce((s, r) => s + r.amount, 0),
    [visibleRows],
  )

  return (
    <section
      id="expenditures"
      className="expenditures"
      aria-labelledby="expenditures-heading"
    >
      <motion.header
        className="section-header"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <div className="section-chapter" aria-hidden>
          <span>VII</span>
        </div>
        <p className="section-eyebrow">Operating budget</p>
        <h2 id="expenditures-heading" className="section-title">
          Behind the scenes
        </h2>
        <p className="section-lede">
          {rows.length === 0
            ? 'Operating expenditures will be published once the cycle is underway.'
            : 'The programs, events, and operations that keep USG running for students — across cabinet, divisions, and partner units.'}
        </p>
      </motion.header>

      {rows.length === 0 ? (
        <TbdCard label="Expenditures" message="To be determined." />
      ) : (
        <>
          <div className="exp-summary">
            <ExpStat label="Operating spend" value={currency(aggregate.total)} accent />
            <ExpStat label="Divisions" value={integer(aggregate.divisions)} />
            <ExpStat label="Categories" value={integer(aggregate.categories)} />
            <ExpStat label="Transactions" value={integer(aggregate.transactions)} />
          </div>

          <div className="exp-layout">
            <aside className="exp-divisions" aria-label="Spend by division">
              <h3 className="exp-subhead">By division</h3>
              <ul className="exp-division-list">
                <li>
                  <DivisionRow
                    label="All divisions"
                    total={aggregate.total}
                    share={1}
                    count={aggregate.transactions}
                    active={filter === 'all'}
                    onClick={() => setFilter('all')}
                  />
                </li>
                {divisions.map((d) => (
                  <li key={d.division}>
                    <DivisionRow
                      label={d.division}
                      total={d.total}
                      share={d.share}
                      count={d.count}
                      active={filter === d.division}
                      onClick={() =>
                        setFilter(filter === d.division ? 'all' : d.division)
                      }
                    />
                  </li>
                ))}
              </ul>
            </aside>

            <div className="exp-table-wrap">
              <div className="exp-table-meta">
                <span>
                  {integer(visibleRows.length)} transactions
                  {filter !== 'all' && ` in ${filter}`}
                </span>
                <span className="exp-table-meta-total">
                  {currency(visibleTotal)} total
                </span>
              </div>
              <ExpendituresTable rows={visibleRows} />
            </div>
          </div>
        </>
      )}
    </section>
  )
}

function ExpStat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className={`exp-stat${accent ? ' exp-stat--accent' : ''}`}>
      <span className="exp-stat-value">{value}</span>
      <span className="exp-stat-label">{label}</span>
    </div>
  )
}

function DivisionRow({
  label,
  total,
  share,
  count,
  active,
  onClick,
}: {
  label: string
  total: number
  share: number
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`exp-division${active ? ' exp-division--active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="exp-division-name">{label}</span>
      <span className="exp-division-track" aria-hidden>
        <span
          className="exp-division-fill"
          style={{ width: `${Math.max(share * 100, 1.5)}%` }}
        />
      </span>
      <span className="exp-division-amount">
        <span>{currencyCompact(total)}</span>
        <span className="exp-division-sub">
          {percent(share)} · {integer(count)} tx
        </span>
      </span>
    </button>
  )
}

function ExpendituresTable({ rows }: { rows: ExpenditureRow[] }) {
  if (rows.length === 0) {
    return <p className="exp-empty">No transactions in this view.</p>
  }
  return (
    <div className="exp-table-scroll">
      <table className="exp-table">
        <thead>
          <tr>
            <th>Division</th>
            <th>Category</th>
            <th>Description</th>
            <th className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.division}-${i}`}>
              <td>
                <span className="exp-cell-division">{r.division}</span>
              </td>
              <td>{r.category || '—'}</td>
              <td className="exp-cell-desc">{r.description || '—'}</td>
              <td className="num strong">{currency(r.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
