import type { Cycle } from '../data/cycles'
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
import { currency, currencyCompact, integer, percent } from '../data/format'

type Props = {
  data: Allocations
  cycle: Cycle
}

const AWARD_FUN_FACTS: Record<string, string> = {
  'phoenix sustainability initiative': '50,000 lbs of food waste composted.',
}

const findExp = (
  rows: ExpenditureRow[],
  match: (r: ExpenditureRow) => boolean,
): ExpenditureRow | null => rows.find(match) ?? null

export function ShareCard({ data, cycle }: Props) {
  const host =
    typeof window !== 'undefined'
      ? window.location.host.replace(/^www\./, '')
      : 'uchicago.edu'

  const requested = totalRequested(data)
  const total = totalAllocated(data)
  const approval = rsoApprovalRate(data)
  const rates = rankedCommitteeRates(data)
  const generous = rates[0]
  const stingy = rates[rates.length - 1]
  const fully = fullyFundedCount(data)
  const denied = deniedCount(data)
  const top = topRsoWithAsk(data)
  const topPct = top && top.requested > 0 ? top.funded / top.requested : 0

  const headliner = data.awards.find((a) =>
    a.award.toLowerCase().includes('rso of the year'),
  )
  const headlinerFact = headliner
    ? AWARD_FUN_FACTS[headliner.rso.toLowerCase()]
    : undefined

  const pizza = findExp(data.expenditures, (r) => /medici/i.test(r.description))
  const canva = findExp(data.expenditures, (r) => /canva/i.test(r.description))

  return (
    <div className="share-card share-card--recap">
      <header className="sc-header">
        <span className="sc-brand">UChicago USG</span>
        <span className="sc-eyebrow">{cycle.label} · Allocations Recap</span>
      </header>

      {requested > 0 && (
        <section className="sc-hero">
          <span className="sc-hero-label">RSOs asked for</span>
          <span className="sc-hero-num">{currencyCompact(requested)}</span>
          {approval.asked > 0 && (
            <span className="sc-hero-sub">
              {percent(approval.rate)} funded · {currencyCompact(total)} total
            </span>
          )}
        </section>
      )}

      <div className="sc-divider" />

      {(fully > 0 || denied > 0) && (
        <section className="sc-row">
          <div className="sc-cell sc-cell--win">
            <span className="sc-cell-num">{integer(fully)}</span>
            <span className="sc-cell-label">got every dollar</span>
          </div>
          <div className="sc-cell">
            <span className="sc-cell-num">{integer(denied)}</span>
            <span className="sc-cell-label">walked away with $0</span>
          </div>
        </section>
      )}

      {generous && stingy && generous.committee !== stingy.committee && (
        <section className="sc-row">
          <div className="sc-cell sc-cell--win">
            <span className="sc-cell-num">{percent(generous.rate)}</span>
            <span className="sc-cell-label">
              {COMMITTEE_SHORT[generous.committee]} funded
            </span>
          </div>
          <div className="sc-cell">
            <span className="sc-cell-num">{percent(stingy.rate)}</span>
            <span className="sc-cell-label">
              {COMMITTEE_SHORT[stingy.committee]} funded
            </span>
          </div>
        </section>
      )}

      <div className="sc-divider" />

      {top && (
        <section className="sc-feature">
          <span className="sc-feature-eyebrow">Biggest payday</span>
          <span className="sc-feature-name">{top.rso}</span>
          <span className="sc-feature-num">{currency(top.funded)}</span>
          <span className="sc-feature-sub">
            {percent(topPct)} of their {currency(top.requested)} ask ·{' '}
            {COMMITTEE_LABELS[top.committee]}
          </span>
        </section>
      )}

      {headliner && (
        <section className="sc-quote-block">
          <span className="sc-feature-eyebrow">RSO of the Year</span>
          {headlinerFact ? (
            <>
              <p className="sc-quote">&ldquo;{headlinerFact}&rdquo;</p>
              <p className="sc-quote-attr">— {headliner.rso}</p>
            </>
          ) : (
            <p className="sc-quote sc-quote--name">{headliner.rso}</p>
          )}
        </section>
      )}

      {pizza && canva && (
        <section className="sc-punch">
          <span className="sc-feature-eyebrow">USG&rsquo;s own ledger</span>
          <p className="sc-punch-line">
            <strong>{currency(pizza.amount)}</strong> on pizza ·{' '}
            <strong>{currency(canva.amount)}</strong> on Canva
          </p>
        </section>
      )}

      <footer className="sc-footer">
        <span className="sc-rule" aria-hidden />
        <span className="sc-url">{host}</span>
      </footer>
    </div>
  )
}
