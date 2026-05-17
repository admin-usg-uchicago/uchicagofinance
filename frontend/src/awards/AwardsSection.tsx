import { useMemo } from 'react'
import { motion } from 'motion/react'
import {
  COMMITTEE_SHORT,
  rsoTotals,
  type Allocations,
  type AwardRow,
  type Committee,
} from '../data/stats'
import { TbdCard } from '../common/TbdCard'

type Props = { data: Allocations }

const HEADLINER_KEY = 'rso of the year'

const isHeadliner = (a: AwardRow) =>
  a.award.toLowerCase().includes(HEADLINER_KEY)

// Awards whose recipients don't appear (or appear under a different name) in
// the allocation tables. Lower-cased RSO name → committee.
const COMMITTEE_OVERRIDES: Record<string, Committee> = {
  'medusa acapella': 'sgfc',
  'central asian studies society': 'sgfc',
}

export function AwardsSection({ data }: Props) {
  const headliner = useMemo(
    () => data.awards.find(isHeadliner) ?? null,
    [data.awards],
  )
  const others = useMemo(
    () => data.awards.filter((a) => a !== headliner),
    [data.awards, headliner],
  )

  const committeeFor = useMemo(() => {
    const totals = rsoTotals(data)
    return (rso: string): Committee | null =>
      totals.get(rso)?.committee ??
      COMMITTEE_OVERRIDES[rso.toLowerCase().trim()] ??
      null
  }, [data])

  const empty = data.awards.length === 0

  return (
    <section id="awards" className="awards" aria-labelledby="awards-heading">
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
        <p className="section-eyebrow">RSO Awards</p>
        <h2 id="awards-heading" className="section-title">
          The year&rsquo;s honorees
        </h2>
        <p className="section-lede">
          {empty
            ? 'Award recipients are announced near the end of the academic year.'
            : 'Seven Registered Student Organizations recognized this year for their impact on campus and beyond.'}
        </p>
      </motion.header>

      {empty ? (
        <TbdCard label="Awards" message="To be determined." />
      ) : (
        <>
          {headliner && (
            <AwardHeadliner
              award={headliner}
              committee={committeeFor(headliner.rso)}
            />
          )}
          <div className="awards-grid">
            {others.map((a, i) => (
              <AwardCard
                key={a.award}
                award={a}
                committee={committeeFor(a.rso)}
                index={i}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function AwardHeadliner({
  award,
  committee,
}: {
  award: AwardRow
  committee: Committee | null
}) {
  return (
    <motion.article
      className="award-headliner"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
      aria-label={`${award.award}: ${award.rso}`}
    >
      <div className="award-headliner-mark" aria-hidden>
        ★
      </div>
      <p className="award-headliner-eyebrow">{award.award}</p>
      <h3 className="award-headliner-name">{award.rso}</h3>
      {committee && (
        <span className="award-chip">{COMMITTEE_SHORT[committee]}</span>
      )}
      <p className="award-headliner-body">{award.description}</p>
    </motion.article>
  )
}

function AwardCard({
  award,
  committee,
  index,
}: {
  award: AwardRow
  committee: Committee | null
  index: number
}) {
  return (
    <motion.article
      className="award-card"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.2, 0.7, 0.2, 1],
      }}
      whileHover={{ y: -4 }}
      aria-label={`${award.award}: ${award.rso}`}
    >
      <p className="award-card-eyebrow">{award.award}</p>
      <h4 className="award-card-name">{award.rso}</h4>
      {committee && (
        <span className="award-chip">{COMMITTEE_SHORT[committee]}</span>
      )}
      <p className="award-card-body">{award.description}</p>
    </motion.article>
  )
}
