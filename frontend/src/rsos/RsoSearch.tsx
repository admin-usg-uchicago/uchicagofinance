import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import {
  COMMITTEE_LABELS,
  COMMITTEE_SHORT,
  allRsoNames,
  perRso,
  rsoTotals,
  type Allocations,
  type Committee,
} from '../data/stats'
import { currency } from '../data/format'

const MAX_SUGGESTIONS = 8

type Props = {
  data: Allocations
  selectedCommittee: Committee | null
}

export function RsoSearch({ data, selectedCommittee }: Props) {
  const [query, setQuery] = useState('')
  const [selectedRso, setSelectedRso] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const totals = useMemo(() => rsoTotals(data), [data])

  const allNames = useMemo(() => {
    const names = allRsoNames(data)
    if (!selectedCommittee) return names
    return names.filter((n) => totals.get(n)?.committee === selectedCommittee)
  }, [data, selectedCommittee, totals])

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allNames.slice(0, MAX_SUGGESTIONS)
    return allNames
      .filter((name) => name.toLowerCase().includes(q))
      .slice(0, MAX_SUGGESTIONS)
  }, [query, allNames])

  useEffect(() => {
    if (selectedRso && !allNames.includes(selectedRso)) {
      setSelectedRso(null)
      setQuery('')
    }
  }, [allNames, selectedRso])

  const pick = (name: string) => {
    setSelectedRso(name)
    setQuery(name)
    setOpen(false)
    inputRef.current?.blur()
  }

  const clear = () => {
    setSelectedRso(null)
    setQuery('')
    setOpen(false)
  }

  const detail = selectedRso ? perRso(data, selectedRso) : null
  const showEmpty = !detail && !open && query.trim() === ''

  return (
    <section
      className="rso-search"
      id="rso-search"
      aria-labelledby="rso-search-heading"
    >
      <motion.header
        className="section-header"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <div className="section-chapter" aria-hidden>
          <span>V</span>
        </div>
        <p className="section-eyebrow">Look up an RSO</p>
        <h2 id="rso-search-heading" className="section-title">
          Find your organization
        </h2>
        <p className="section-lede">
          Search by name to see every allocation your RSO received this year and
          how it ranks within its committee.
        </p>
      </motion.header>

      <div className="rso-controls">
        <div className={`rso-input-wrap ${open ? 'is-open' : ''}`}>
          <input
            ref={inputRef}
            className="rso-input"
            type="search"
            placeholder="Search RSOs by name…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
              if (selectedRso) setSelectedRso(null)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="rso-suggestions"
          />
          {(query || selectedRso) && (
            <button
              type="button"
              className="rso-input-clear"
              onClick={clear}
              aria-label="Clear search"
            >
              &times;
            </button>
          )}

          {open && suggestions.length > 0 && (
            <ul
              id="rso-suggestions"
              className="rso-suggestions"
              role="listbox"
            >
              {suggestions.map((name) => {
                const t = totals.get(name)
                return (
                  <li key={name}>
                    <button
                      type="button"
                      className="rso-suggestion"
                      role="option"
                      aria-selected={selectedRso === name}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(name)}
                    >
                      <span className="rso-suggestion-name">{name}</span>
                      {t && (
                        <span className="rso-suggestion-meta">
                          <span className="rso-suggestion-chip">
                            {COMMITTEE_SHORT[t.committee]}
                          </span>
                          <span>{currency(t.total)}</span>
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {detail ? (
          <motion.div
            key={detail.rso}
            className="rso-panel"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <div className="rso-panel-head">
              <span className="rso-panel-chip">
                {COMMITTEE_SHORT[detail.committee]}
              </span>
              <h3 className="rso-panel-name">{detail.rso}</h3>
              <p className="rso-panel-committee">
                {COMMITTEE_LABELS[detail.committee]}
              </p>
            </div>

            <div className="rso-panel-totals">
              <div className="rso-panel-total">
                <span className="rso-panel-total-label">Total received</span>
                <span className="rso-panel-total-value">
                  {currency(detail.totals.total)}
                </span>
              </div>
              <div className="rso-panel-total">
                <span className="rso-panel-total-label">Annual</span>
                <span className="rso-panel-total-value">
                  {currency(detail.totals.annual)}
                </span>
              </div>
              <div className="rso-panel-total">
                <span className="rso-panel-total-label">Recurring</span>
                <span className="rso-panel-total-value">
                  {currency(detail.totals.recurring)}
                </span>
              </div>
              <div className="rso-panel-total">
                <span className="rso-panel-total-label">
                  Rank in {COMMITTEE_SHORT[detail.committee]}
                </span>
                <span className="rso-panel-total-value">
                  {detail.rankInCommittee > 0
                    ? `#${detail.rankInCommittee} of ${detail.committeeSize}`
                    : '—'}
                </span>
              </div>
            </div>

            {detail.requests.length > 0 && (
              <div className="rso-requests">
                <h4 className="rso-requests-heading">Every request this year</h4>
                <table className="rso-requests-table">
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
                        <td className="rso-request-desc">
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
              </div>
            )}
          </motion.div>
        ) : showEmpty ? (
          <motion.p
            key="empty"
            className="rso-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            Start typing to look up an RSO.
          </motion.p>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
