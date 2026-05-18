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
import type { Cycle } from '../data/cycles'

export type ShareCardPayload = {
  eyebrow: string
  headline: string
  sub?: string
  comparison?: {
    leftLabel: string
    leftValue: string
    rightLabel: string
    rightValue: string
  }
  quote?: string
  attribution?: string
}

export type SlideDef = {
  id: string
  caption: string
  body: ReactNode
  shareCard: ShareCardPayload
}

type BuildOpts = {
  onExplore?: () => void
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

// Inline mini-bar comparing requested vs funded for a single RSO.
function RequestVsFundedBar({
  requested,
  funded,
}: {
  requested: number
  funded: number
}) {
  const max = Math.max(requested, funded, 1)
  const reqW = (requested / max) * 100
  const fundW = (funded / max) * 100
  return (
    <svg
      className="slide-bar"
      viewBox="0 0 360 88"
      width="360"
      height="88"
      role="img"
      aria-label={`Requested ${currency(requested)}, funded ${currency(funded)}`}
    >
      <text
        x="0"
        y="12"
        fontSize="11"
        fill="rgba(255, 250, 247, 0.75)"
        fontFamily="'Public Sans', system-ui, sans-serif"
      >
        Requested · {currency(requested)}
      </text>
      <rect
        x="0"
        y="18"
        width="360"
        height="14"
        rx="7"
        fill="rgba(255, 250, 247, 0.12)"
      />
      <rect
        x="0"
        y="18"
        width={(reqW / 100) * 360}
        height="14"
        rx="7"
        fill="rgba(255, 250, 247, 0.55)"
      />

      <text
        x="0"
        y="56"
        fontSize="11"
        fill="rgba(255, 250, 247, 0.92)"
        fontFamily="'Public Sans', system-ui, sans-serif"
        fontWeight="600"
      >
        Funded · {currency(funded)}
      </text>
      <rect
        x="0"
        y="62"
        width="360"
        height="14"
        rx="7"
        fill="rgba(255, 250, 247, 0.12)"
      />
      <rect
        x="0"
        y="62"
        width={(fundW / 100) * 360}
        height="14"
        rx="7"
        fill="#fffaf7"
      />
    </svg>
  )
}

export function buildSlides(
  data: Allocations,
  cycle: Cycle,
  opts: BuildOpts = {},
): SlideDef[] {
  const cycleShort = cycle.short
  const cycleLabel = cycle.label

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
      caption: `RSOs asked USG for ${currencyCompact(requested)} in ${cycleShort}.`,
      body: (
        <>
          <Eyebrow>In {cycleShort}, RSOs asked USG for</Eyebrow>
          <Big>
            <AnimatedNumber value={requested} format={currency} />
          </Big>
          <Sub>across every funding committee</Sub>
        </>
      ),
      shareCard: {
        eyebrow: `In ${cycleShort}, RSOs asked USG for`,
        headline: currencyCompact(requested),
        sub: 'across every funding committee',
      },
    })
  }

  if (approval.asked > 0) {
    slides.push({
      id: 'approval-rate',
      caption: `USG funded ${percent(approval.rate)} of the RSOs that asked in ${cycleShort}.`,
      body: (
        <>
          <Eyebrow>Of those, USG funded</Eyebrow>
          <Big>
            <AnimatedNumber value={approval.rate} format={percent} />
          </Big>
          <Sub>
            of the RSOs that asked &mdash; {integer(approval.funded)} of{' '}
            {integer(approval.asked)} walked away with something
            {total > 0 && <> ({currencyCompact(total)} total)</>}
          </Sub>
        </>
      ),
      shareCard: {
        eyebrow: 'Of those, USG funded',
        headline: percent(approval.rate),
        sub: `${integer(approval.funded)} of ${integer(approval.asked)} RSOs walked away with something${total > 0 ? ` (${currencyCompact(total)} total)` : ''}`,
      },
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
              <span className="slide-twin-cap">of requests funded</span>
            </div>
            <span className="slide-twin-divider" aria-hidden>
              vs
            </span>
            <div className="slide-twin-item">
              <span className="slide-twin-num">{percent(stingy.rate)}</span>
              <span className="slide-twin-label">
                {COMMITTEE_SHORT[stingy.committee]}
              </span>
              <span className="slide-twin-cap">of requests funded</span>
            </div>
          </div>
          <Sub>
            {COMMITTEE_LABELS[generous.committee]} vs.{' '}
            {COMMITTEE_LABELS[stingy.committee]}
          </Sub>
        </>
      ),
      shareCard: {
        eyebrow: 'Most generous vs. toughest room',
        headline: '',
        comparison: {
          leftLabel: COMMITTEE_SHORT[generous.committee],
          leftValue: percent(generous.rate),
          rightLabel: COMMITTEE_SHORT[stingy.committee],
          rightValue: percent(stingy.rate),
        },
        sub: `${COMMITTEE_LABELS[generous.committee]} vs. ${COMMITTEE_LABELS[stingy.committee]}`,
      },
    })
  }

  if (fullyFunded > 0 || denied > 0) {
    slides.push({
      id: 'fully-funded',
      caption:
        denied > 0
          ? `${integer(fullyFunded)} RSOs got every dollar in ${cycleShort}; ${integer(denied)} got nothing.`
          : `${integer(fullyFunded)} RSOs got every dollar in ${cycleShort}.`,
      body: (
        <>
          <Eyebrow>Got everything &middot; got nothing</Eyebrow>
          <div className="slide-twin">
            <div className="slide-twin-item slide-twin-item--win">
              <span className="slide-twin-num">{integer(fullyFunded)}</span>
              <span className="slide-twin-label">Fully funded</span>
              <span className="slide-twin-cap">got every dollar asked</span>
            </div>
            <span className="slide-twin-divider" aria-hidden>
              vs
            </span>
            <div className="slide-twin-item">
              <span className="slide-twin-num">{integer(denied)}</span>
              <span className="slide-twin-label">Walked away with $0</span>
              <span className="slide-twin-cap">asked but unfunded</span>
            </div>
          </div>
        </>
      ),
      shareCard: {
        eyebrow: 'Got everything · got nothing',
        headline: '',
        comparison: {
          leftLabel: 'Fully funded',
          leftValue: integer(fullyFunded),
          rightLabel: 'Walked away with $0',
          rightValue: integer(denied),
        },
      },
    })
  }

  if (top) {
    const pct = top.requested > 0 ? top.funded / top.requested : 0
    slides.push({
      id: 'top-rso',
      caption: `${top.rso} took home ${currency(top.funded)} — the largest payday in ${cycleShort}.`,
      body: (
        <>
          <Eyebrow>Biggest payday of {cycleShort}</Eyebrow>
          <p className="slide-mid">{top.rso}</p>
          <Big>
            <AnimatedNumber value={top.funded} format={currency} />
          </Big>
          <RequestVsFundedBar requested={top.requested} funded={top.funded} />
          <Sub>
            {percent(pct)} of their ask &middot; {COMMITTEE_LABELS[top.committee]}
          </Sub>
        </>
      ),
      shareCard: {
        eyebrow: `Biggest payday of ${cycleShort} — ${top.rso}`,
        headline: currency(top.funded),
        sub: `${percent(pct)} of their ${currency(top.requested)} ask · ${COMMITTEE_LABELS[top.committee]}`,
      },
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
      shareCard: {
        eyebrow: 'RSO of the Year did what?',
        headline: '',
        quote: headlinerFact,
        attribution: `${headliner.rso}, ${cycleShort} top honor`,
      },
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
      caption: `USG spent ${currency(pizza.amount)} on pizza and ${currency(canva.amount)} on Canva in ${cycleShort}.`,
      body: (
        <>
          <Eyebrow>USG&rsquo;s own ledger, {cycleShort}</Eyebrow>
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
          <Sub>Cabinet bought more lunch than software.</Sub>
        </>
      ),
      shareCard: {
        eyebrow: `USG's own ledger, ${cycleShort}`,
        headline: '',
        comparison: {
          leftLabel: 'on pizza',
          leftValue: currency(pizza.amount),
          rightLabel: 'on Canva',
          rightValue: currency(canva.amount),
        },
        sub: 'Cabinet bought more lunch than software.',
      },
    })
  }

  slides.push({
    id: 'outro',
    caption: `That was ${cycleLabel}. See the full breakdown.`,
    body: (
      <>
        <Eyebrow>That&rsquo;s {cycleLabel} in numbers.</Eyebrow>
        <p className="slide-outro">
          Committee breakdowns, awards, your RSO&rsquo;s detail, and USG&rsquo;s
          internal ledger are waiting below.
        </p>
        <button
          type="button"
          className="slide-cta"
          onClick={() => opts.onExplore?.()}
        >
          See the full breakdown →
        </button>
      </>
    ),
    shareCard: {
      eyebrow: `That's ${cycleLabel} in numbers.`,
      headline: cycleLabel,
      sub: 'See the full breakdown at the link below.',
    },
  })

  return slides
}
