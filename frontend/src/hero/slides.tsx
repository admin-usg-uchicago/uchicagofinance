import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { AnimatedNumber } from './AnimatedNumber'
import { currency, currencyCompact, integer, percent } from '../data/format'
import {
  COMMITTEE_LABELS,
  COMMITTEE_SHORT,
  deniedCount,
  fullyFundedCount,
  rankedCommitteeRates,
  rsoApprovalRate,
  topRsoWithAsk,
  totalAllocated,
  totalRequested,
  type Allocations,
  type ExpenditureRow,
} from '../data/stats'

export type SlideDef = {
  id: string
  caption: string
  body: ReactNode
}

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <p className="slide-eyebrow">{children}</p>
)
const Big = ({ children }: { children: ReactNode }) => (
  <p className="slide-big">{children}</p>
)
const Sub = ({ children }: { children: ReactNode }) => (
  <p className="slide-sub">{children}</p>
)

// Hardcoded fun pulls from a known award description. If the headliner RSO
// changes year-over-year, update or extend this lookup.
const AWARD_FUN_FACTS: Record<string, string> = {
  'phoenix sustainability initiative': '50,000 lbs of food waste composted.',
}

// Internal-spend fun pairs: find two transactions whose contrast tells a story.
const findExp = (
  rows: ExpenditureRow[],
  match: (r: ExpenditureRow) => boolean,
): ExpenditureRow | null => rows.find(match) ?? null

export function buildSlides(data: Allocations): SlideDef[] {
  const requested = totalRequested(data)
  const total = totalAllocated(data)
  const approval = rsoApprovalRate(data)
  const rates = rankedCommitteeRates(data)
  const generous = rates[0]
  const stingy = rates[rates.length - 1]
  const fullyFunded = fullyFundedCount(data)
  const denied = deniedCount(data)
  const top = topRsoWithAsk(data)

  const slides: SlideDef[] = []

  if (requested > 0) {
    slides.push({
      id: 'asked',
      caption: `RSOs asked USG for ${currencyCompact(requested)} this year.`,
      body: (
        <>
          <Eyebrow>RSOs asked USG for</Eyebrow>
          <Big>
            <AnimatedNumber value={requested} format={currency} />
          </Big>
          <Sub>across every funding committee</Sub>
        </>
      ),
    })
  }

  if (approval.asked > 0) {
    slides.push({
      id: 'approval-rate',
      caption: `USG funded ${percent(approval.rate)} of the RSOs that asked.`,
      body: (
        <>
          <Eyebrow>USG funded</Eyebrow>
          <Big>
            <AnimatedNumber value={approval.rate} format={percent} />
          </Big>
          <Sub>
            of the RSOs that asked &mdash; {integer(approval.funded)} of{' '}
            {integer(approval.asked)} walked away with something
            {total > 0 && <> ({currencyCompact(total)} in total)</>}
          </Sub>
        </>
      ),
    })
  }

  if (generous && stingy && generous.committee !== stingy.committee) {
    slides.push({
      id: 'committee-contrast',
      caption: `${COMMITTEE_SHORT[generous.committee]} funded ${percent(generous.rate)} of requests; ${COMMITTEE_SHORT[stingy.committee]} funded ${percent(stingy.rate)}.`,
      body: (
        <>
          <Eyebrow>Most generous vs. toughest room</Eyebrow>
          <div className="slide-twin">
            <div className="slide-twin-item slide-twin-item--win">
              <span className="slide-twin-num">{percent(generous.rate)}</span>
              <span className="slide-twin-label">
                {COMMITTEE_SHORT[generous.committee]}
              </span>
              <span className="slide-twin-cap">funded</span>
            </div>
            <span className="slide-twin-divider" aria-hidden>
              vs
            </span>
            <div className="slide-twin-item">
              <span className="slide-twin-num">{percent(stingy.rate)}</span>
              <span className="slide-twin-label">
                {COMMITTEE_SHORT[stingy.committee]}
              </span>
              <span className="slide-twin-cap">funded</span>
            </div>
          </div>
          <Sub>
            {COMMITTEE_LABELS[generous.committee]} vs.{' '}
            {COMMITTEE_LABELS[stingy.committee]}
          </Sub>
        </>
      ),
    })
  }

  if (fullyFunded > 0) {
    slides.push({
      id: 'fully-funded',
      caption: `${integer(fullyFunded)} RSOs got every dollar they asked for.`,
      body: (
        <>
          <Eyebrow>Even so,</Eyebrow>
          <Big>
            <AnimatedNumber value={fullyFunded} format={integer} />
          </Big>
          <Sub>
            RSOs got every dollar they asked for
            {denied > 0 && (
              <> &mdash; while {integer(denied)} walked away with $0</>
            )}
          </Sub>
        </>
      ),
    })
  }

  if (top) {
    const pct = top.requested > 0 ? top.funded / top.requested : 0
    slides.push({
      id: 'top-rso',
      caption: `${top.rso} took home ${currency(top.funded)} — the largest payday this year.`,
      body: (
        <>
          <Eyebrow>Biggest payday</Eyebrow>
          <p className="slide-mid">{top.rso}</p>
          <Big>
            <AnimatedNumber value={top.funded} format={currency} />
          </Big>
          <Sub>
            {percent(pct)} of their {currency(top.requested)} ask &middot;{' '}
            {COMMITTEE_LABELS[top.committee]}
          </Sub>
        </>
      ),
    })
  }

  const headliner = data.awards.find((a) =>
    a.award.toLowerCase().includes('rso of the year'),
  )
  const headlinerFact = headliner
    ? AWARD_FUN_FACTS[headliner.rso.toLowerCase()]
    : undefined
  if (headliner && headlinerFact) {
    slides.push({
      id: 'award-fact',
      caption: `${headliner.rso} took home this year's top award.`,
      body: (
        <>
          <Eyebrow>RSO of the Year did what?</Eyebrow>
          <p className="slide-quote">&ldquo;{headlinerFact}&rdquo;</p>
          <p className="slide-quote-attribution">
            &mdash; {headliner.rso}, this year&rsquo;s top honor
          </p>
        </>
      ),
    })
  }

  // Internal-spend punchline: USG spent more on pizza than on Canva.
  const pizza = findExp(data.expenditures, (r) =>
    /medici/i.test(r.description),
  )
  const canva = findExp(data.expenditures, (r) => /canva/i.test(r.description))
  if (pizza && canva) {
    slides.push({
      id: 'internal-punchline',
      caption: `USG spent ${currency(pizza.amount)} on pizza and ${currency(canva.amount)} on Canva this year.`,
      body: (
        <>
          <Eyebrow>USG&rsquo;s own ledger</Eyebrow>
          <div className="slide-pair">
            <div className="slide-pair-row">
              <span className="slide-pair-amt">{currency(pizza.amount)}</span>
              <span className="slide-pair-what">on pizza</span>
            </div>
            <div className="slide-pair-row">
              <span className="slide-pair-amt">{currency(canva.amount)}</span>
              <span className="slide-pair-what">on Canva</span>
            </div>
          </div>
          <Sub>Cabinet bought more lunch than software this year.</Sub>
        </>
      ),
    })
  }

  slides.push({
    id: 'outro',
    caption: 'See the full breakdown below.',
    body: (
      <>
        <Eyebrow>That&rsquo;s the year in numbers.</Eyebrow>
        <p className="slide-outro">
          Keep scrolling for committee breakdowns, awards, your RSO&rsquo;s detail,
          and USG&rsquo;s internal ledger.
        </p>
        <motion.div
          className="slide-chevron"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          aria-hidden
        >
          &darr;
        </motion.div>
      </>
    ),
  })

  return slides
}
