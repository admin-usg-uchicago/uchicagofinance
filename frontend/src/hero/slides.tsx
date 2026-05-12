import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { AnimatedNumber } from './AnimatedNumber'
import { currency, currencyCompact, integer, percent } from '../data/format'
import {
  approvalRate,
  biggestGrant,
  COMMITTEE_LABELS,
  rsosFunded,
  topRso,
  totalAllocated,
  totalOperatingBudget,
  totalRequests,
  type Allocations,
} from '../data/stats'

export type SlideDef = {
  id: string
  caption: string
  body: ReactNode
}

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <p className="slide-eyebrow">{children}</p>
)
const Mid = ({ children }: { children: ReactNode }) => (
  <p className="slide-mid">{children}</p>
)
const Big = ({ children }: { children: ReactNode }) => (
  <p className="slide-big">{children}</p>
)
const Sub = ({ children }: { children: ReactNode }) => (
  <p className="slide-sub">{children}</p>
)

export function buildSlides(data: Allocations): SlideDef[] {
  const total = totalAllocated(data)
  const operating = totalOperatingBudget(data)
  const rsoCount = rsosFunded(data)
  const requests = totalRequests(data)
  const big = biggestGrant(data)
  const top = topRso(data)
  const rate = approvalRate(data)

  const slides: SlideDef[] = [
    {
      id: 'total',
      caption: `This year, UChicago USG allocated ${currencyCompact(total)} to student organizations.`,
      body: (
        <>
          <Eyebrow>This year, UChicago USG allocated</Eyebrow>
          <Big>
            <AnimatedNumber value={total} format={currency} />
          </Big>
          <Sub>to Registered Student Organizations</Sub>
        </>
      ),
    },
    {
      id: 'operating-budget',
      caption: `USG operated on a ${currencyCompact(operating)} budget this year.`,
      body: (
        <>
          <Eyebrow>USG operated on a</Eyebrow>
          <Big>
            <AnimatedNumber value={operating} format={currency} />
          </Big>
          <Sub>total budget across every account</Sub>
        </>
      ),
    },
    {
      id: 'rsos',
      caption: `${rsoCount} RSOs received funding this year.`,
      body: (
        <>
          <Eyebrow>spread across</Eyebrow>
          <Big>
            <AnimatedNumber value={rsoCount} format={integer} />
          </Big>
          <Sub>Registered Student Organizations</Sub>
        </>
      ),
    },
    {
      id: 'requests',
      caption: `${requests} individual funding decisions handled this year.`,
      body: (
        <>
          <Eyebrow>across</Eyebrow>
          <Big>
            <AnimatedNumber value={requests} format={integer} />
          </Big>
          <Sub>individual funding decisions</Sub>
        </>
      ),
    },
  ]

  if (big) {
    slides.push({
      id: 'biggest-grant',
      caption: `The largest single grant this year was ${currency(big.amount)} to ${big.rso}.`,
      body: (
        <>
          <Eyebrow>The single largest grant</Eyebrow>
          <Mid>{big.rso}</Mid>
          <Big>
            <AnimatedNumber value={big.amount} format={currency} />
          </Big>
          <Sub>{COMMITTEE_LABELS[big.committee]}</Sub>
        </>
      ),
    })
  }

  if (top) {
    slides.push({
      id: 'top-rso',
      caption: `${top.rso} received the most total funding this year: ${currency(top.total)}.`,
      body: (
        <>
          <Eyebrow>The most-funded RSO of the year</Eyebrow>
          <Mid>{top.rso}</Mid>
          <Big>
            <AnimatedNumber value={top.total} format={currency} />
          </Big>
          <Sub>across all of their requests</Sub>
        </>
      ),
    })
  }

  slides.push({
    id: 'approval-rate',
    caption: `${percent(rate)} of every dollar requested was funded.`,
    body: (
      <>
        <Eyebrow>For every dollar requested,</Eyebrow>
        <Big>
          <AnimatedNumber value={rate} format={percent} />
        </Big>
        <Sub>became a dollar funded</Sub>
      </>
    ),
  })

  slides.push({
    id: 'outro',
    caption: 'See the full breakdown at uchicagousg.org',
    body: (
      <>
        <Eyebrow>That&rsquo;s a wrap on 2025&ndash;26.</Eyebrow>
        <p className="slide-outro">
          Keep scrolling for the committee breakdowns and to look up your RSO.
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
