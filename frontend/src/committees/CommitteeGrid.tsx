import { motion } from 'motion/react'
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
  onCommitteeSelect: (c: Committee) => void
}

export function CommitteeGrid({ data, onCommitteeSelect }: Props) {
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
          Where the money went
        </h2>
        <p className="section-lede">
          Five funding bodies make every allocation decision. Tap any committee
          to filter the RSO list below.
        </p>
      </motion.header>

      <div className="committee-grid">
        {COMMITTEES.map((c, i) => {
          const stats = perCommittee(data, c)
          const max = Math.max(1, ...stats.topRsos.map((r) => r.total))
          return (
            <motion.button
              key={c}
              type="button"
              className="committee-card"
              onClick={() => onCommitteeSelect(c)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.2, 0.7, 0.2, 1] }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.99 }}
              aria-label={`${COMMITTEE_LABELS[c]} — view RSOs`}
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
        })}
      </div>
    </section>
  )
}
