import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  COMMITTEE_LABELS,
  COMMITTEE_SHORT,
  COMMITTEES,
  perCommittee,
  type Allocations,
  type Committee,
} from '../data/stats'
import { currency, integer } from '../data/format'

type Props = {
  data: Allocations
  selectedCommittee: Committee | null
  onSelectCommittee: (c: Committee | null) => void
  topN: number
  controlsSlot?: ReactNode
}

const COLLAPSED_BARS = 5

export function CommitteeGrid({
  data,
  selectedCommittee,
  onSelectCommittee,
  topN,
  controlsSlot,
}: Props) {
  const expanded = selectedCommittee

  const renderCard = (c: Committee, i: number) => {
    const stats = perCommittee(data, c, COLLAPSED_BARS)
    const max = Math.max(1, ...stats.topRsos.map((r) => r.total))
    return (
      <motion.button
        key={c}
        type="button"
        className="committee-card"
        onClick={() => onSelectCommittee(c)}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, delay: i * 0.06, ease: [0.2, 0.7, 0.2, 1] }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.99 }}
        aria-expanded={false}
        aria-label={`${COMMITTEE_LABELS[c]} — show all RSOs`}
      >
        <div className="committee-head">
          <span className="committee-chip">{COMMITTEE_SHORT[c]}</span>
          <span className="committee-name">{COMMITTEE_LABELS[c]}</span>
        </div>

        <div className="committee-stat">
          <span className="committee-stat-value">
            {currency(stats.totalAllocated)}
          </span>
          <span className="committee-stat-label">allocated</span>
        </div>

        <p className="committee-sub">
          <span className="committee-count">{integer(stats.rsoCount)}</span>{' '}
          {stats.rsoCount === 1 ? 'RSO funded' : 'RSOs funded'}
        </p>

        {stats.topRsos.length > 0 && (
          <ul className="committee-bars" aria-label="Top recipients">
            {stats.topRsos.map((r) => (
              <li key={r.rso} className="committee-bar-row">
                <span className="committee-bar-name" title={r.rso}>
                  {r.rso}
                </span>
                <span className="committee-bar-track" aria-hidden>
                  <span
                    className="committee-bar-fill"
                    style={{ width: `${(r.total / max) * 100}%` }}
                  />
                </span>
                <span className="committee-bar-amount">
                  {currency(r.total)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <span className="committee-cta" aria-hidden>
          Browse RSOs &rarr;
        </span>
      </motion.button>
    )
  }

  const renderSolo = (c: Committee) => {
    const stats = perCommittee(data, c, topN)
    const max = Math.max(1, ...stats.topRsos.map((r) => r.total))
    return (
      <motion.article
        key={`solo-${c}`}
        className="committee-card committee-card--solo"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
        aria-label={COMMITTEE_LABELS[c]}
      >
        <div className="committee-solo-toolbar">
          <button
            type="button"
            className="committee-solo-back"
            onClick={() => onSelectCommittee(null)}
            aria-label="Show all committees"
          >
            &larr; All committees
          </button>
        </div>

        <div className="committee-head">
          <span className="committee-chip">{COMMITTEE_SHORT[c]}</span>
          <span className="committee-name">{COMMITTEE_LABELS[c]}</span>
        </div>

        <div className="committee-solo-stats">
          <div className="committee-stat">
            <span className="committee-stat-value">
              {currency(stats.totalAllocated)}
            </span>
            <span className="committee-stat-label">allocated</span>
          </div>
          <p className="committee-sub">
            <span className="committee-count">{integer(stats.rsoCount)}</span>{' '}
            {stats.rsoCount === 1 ? 'RSO funded' : 'RSOs funded'}
          </p>
        </div>

        {stats.topRsos.length > 0 && (
          <ul
            className="committee-bars committee-bars--solo"
            aria-label="All recipients, ranked"
          >
            {stats.topRsos.map((r, idx) => (
              <li key={r.rso} className="committee-bar-row">
                <span className="committee-bar-rank" aria-hidden>
                  {idx + 1}
                </span>
                <span className="committee-bar-name" title={r.rso}>
                  {r.rso}
                </span>
                <span className="committee-bar-track" aria-hidden>
                  <span
                    className="committee-bar-fill"
                    style={{ width: `${(r.total / max) * 100}%` }}
                  />
                </span>
                <span className="committee-bar-amount">
                  {currency(r.total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </motion.article>
    )
  }

  const primary = COMMITTEES.slice(0, 2)
  const secondary = COMMITTEES.slice(2)

  return (
    <section
      id="committees"
      className="committees"
      aria-labelledby="committees-heading"
    >
      <motion.header
        className="section-header"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <div className="section-chapter" aria-hidden>
          <span>II</span>
        </div>
        <p className="section-eyebrow">By committee</p>
        <h2 id="committees-heading" className="section-title">
          Allocation breakdown by committee
        </h2>
        <p className="section-lede">
          Five funding bodies make every allocation decision. Tap any card to
          see every RSO it funded.
        </p>
      </motion.header>

      {controlsSlot}

      <AnimatePresence mode="wait" initial={false}>
        {expanded ? (
          renderSolo(expanded)
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="committee-grid committee-grid--two">
              {primary.map((c, i) => renderCard(c, i))}
            </div>
            <div className="committee-grid committee-grid--three">
              {secondary.map((c, i) => renderCard(c, i + primary.length))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
