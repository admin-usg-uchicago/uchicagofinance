export type Committee = 'cat' | 'csf' | 'pcc' | 'scf' | 'sgfc'

export type AnnualRow = {
  rso: string
  committee: Committee
  requested: number
  final: number
}

export type RecurringRow = AnnualRow & {
  description: string
  type: string
}

export type BudgetRow = {
  account: string
  beginningBalance: number
  allocated2526: number
  expenditures2526: number
  endingBalance: number
  allocated2627: number
}

export type AwardRow = {
  rso: string
  award: string
  description: string
}

export type ExpenditureRow = {
  division: string
  category: string
  description: string
  amount: number
}

export type Allocations = {
  annual: AnnualRow[]
  recurring: RecurringRow[]
  budget: BudgetRow[]
  awards: AwardRow[]
  expenditures: ExpenditureRow[]
}

export const COMMITTEES: Committee[] = ['sgfc', 'csf', 'pcc', 'cat', 'scf']

export const COMMITTEE_LABELS: Record<Committee, string> = {
  sgfc: 'Student Government Finance Committee',
  pcc: 'Program Coordinating Council',
  cat: 'Committee on Academic Teams',
  scf: 'Sports Club Finance Committee',
  csf: 'Community Service Fund',
}

export const COMMITTEE_SHORT: Record<Committee, string> = {
  sgfc: 'SGFC',
  pcc: 'PCC',
  cat: 'CAT',
  scf: 'SCF',
  csf: 'CSF',
}

type AnyRow = AnnualRow | RecurringRow

const sumFinal = (rows: AnyRow[]) => rows.reduce((s, r) => s + r.final, 0)
const sumRequested = (rows: AnyRow[]) => rows.reduce((s, r) => s + r.requested, 0)

export const totalAllocated = (a: Allocations) =>
  sumFinal(a.annual) + sumFinal(a.recurring)

export const totalRequested = (a: Allocations) =>
  sumRequested(a.annual) + sumRequested(a.recurring)

export const totalRequests = (a: Allocations) =>
  a.annual.length + a.recurring.length

export const rsosFunded = (a: Allocations) => {
  const names = new Set<string>()
  for (const r of a.annual) if (r.final > 0) names.add(r.rso)
  for (const r of a.recurring) if (r.final > 0) names.add(r.rso)
  return names.size
}

/** Share of RSOs that got >$0 funded out of those that asked for >$0.
 *  Each RSO counts equally regardless of request size. */
export const rsoApprovalRate = (a: Allocations) => {
  let asked = 0
  let funded = 0
  for (const e of _rsoSums(a).values()) {
    if (e.requested > 0) {
      asked += 1
      if (e.funded > 0) funded += 1
    }
  }
  return asked > 0 ? { rate: funded / asked, asked, funded } : { rate: 0, asked: 0, funded: 0 }
}

const _rsoSums = (a: Allocations) => {
  const map = new Map<string, { requested: number; funded: number }>()
  const bump = (rso: string, req: number, fin: number) => {
    const e = map.get(rso) ?? { requested: 0, funded: 0 }
    e.requested += req
    e.funded += fin
    map.set(rso, e)
  }
  for (const r of a.annual) bump(r.rso, r.requested, r.final)
  for (const r of a.recurring) bump(r.rso, r.requested, r.final)
  return map
}

export const fullyFundedCount = (a: Allocations): number => {
  let n = 0
  for (const e of _rsoSums(a).values()) {
    if (e.requested > 0 && e.funded >= e.requested) n += 1
  }
  return n
}

export const deniedCount = (a: Allocations): number => {
  let n = 0
  for (const e of _rsoSums(a).values()) {
    if (e.requested > 0 && e.funded === 0) n += 1
  }
  return n
}

export type CommitteeRate = { committee: Committee; rate: number }

export const rankedCommitteeRates = (a: Allocations): CommitteeRate[] => {
  const byC = new Map<Committee, { req: number; fin: number }>()
  const bump = (c: Committee, req: number, fin: number) => {
    const e = byC.get(c) ?? { req: 0, fin: 0 }
    e.req += req
    e.fin += fin
    byC.set(c, e)
  }
  for (const r of a.annual) bump(r.committee, r.requested, r.final)
  for (const r of a.recurring) bump(r.committee, r.requested, r.final)
  return [...byC.entries()]
    .filter(([, v]) => v.req > 0)
    .map(([committee, v]) => ({ committee, rate: v.fin / v.req }))
    .sort((a, b) => b.rate - a.rate)
}

export type TopRsoFact = {
  rso: string
  committee: Committee
  requested: number
  funded: number
}

export const topRsoWithAsk = (a: Allocations): TopRsoFact | null => {
  const sums = _rsoSums(a)
  const committeeOf = new Map<string, Committee>()
  for (const r of a.annual) committeeOf.set(r.rso, r.committee)
  for (const r of a.recurring) {
    if (!committeeOf.has(r.rso)) committeeOf.set(r.rso, r.committee)
  }
  let best: TopRsoFact | null = null
  for (const [rso, e] of sums.entries()) {
    const c = committeeOf.get(rso)
    if (!c) continue
    if (!best || e.funded > best.funded) {
      best = { rso, committee: c, requested: e.requested, funded: e.funded }
    }
  }
  return best
}

export const totalOperatingBudget = (a: Allocations) =>
  a.budget.reduce((s, r) => s + r.allocated2526, 0)

export const totalExpenditures = (a: Allocations) =>
  a.budget.reduce((s, r) => s + r.expenditures2526, 0)

export type RsoTotal = {
  rso: string
  committee: Committee
  annual: number
  recurring: number
  total: number
}

export const rsoTotals = (a: Allocations): Map<string, RsoTotal> => {
  const map = new Map<string, RsoTotal>()
  const bump = (
    rso: string,
    committee: Committee,
    amt: number,
    kind: 'annual' | 'recurring',
  ) => {
    let entry = map.get(rso)
    if (!entry) {
      entry = { rso, committee, annual: 0, recurring: 0, total: 0 }
      map.set(rso, entry)
    }
    entry[kind] += amt
    entry.total += amt
  }
  for (const r of a.annual) bump(r.rso, r.committee, r.final, 'annual')
  for (const r of a.recurring) bump(r.rso, r.committee, r.final, 'recurring')
  return map
}

export const topRso = (a: Allocations): RsoTotal | null => {
  let best: RsoTotal | null = null
  for (const entry of rsoTotals(a).values()) {
    if (!best || entry.total > best.total) best = entry
  }
  return best
}

export type CommitteeStats = {
  committee: Committee
  totalAllocated: number
  totalRequested: number
  rsoCount: number
  topRsos: RsoTotal[]
}

export const perCommittee = (
  a: Allocations,
  c: Committee,
  limit = 5,
): CommitteeStats => {
  const annual = a.annual.filter((r) => r.committee === c)
  const recurring = a.recurring.filter((r) => r.committee === c)
  const totals = new Map<string, RsoTotal>()
  const bump = (rso: string, amt: number, kind: 'annual' | 'recurring') => {
    let entry = totals.get(rso)
    if (!entry) {
      entry = { rso, committee: c, annual: 0, recurring: 0, total: 0 }
      totals.set(rso, entry)
    }
    entry[kind] += amt
    entry.total += amt
  }
  for (const r of annual) bump(r.rso, r.final, 'annual')
  for (const r of recurring) bump(r.rso, r.final, 'recurring')

  const topRsos = [...totals.values()]
    .filter((r) => r.total > 0)
    .sort((x, y) => y.total - x.total)
    .slice(0, limit)

  return {
    committee: c,
    totalAllocated: sumFinal(annual) + sumFinal(recurring),
    totalRequested: sumRequested(annual) + sumRequested(recurring),
    rsoCount: [...totals.values()].filter((r) => r.total > 0).length,
    topRsos,
  }
}

export type RsoDetail = {
  rso: string
  committee: Committee
  totals: { annual: number; recurring: number; total: number }
  requests: Array<{
    kind: 'annual' | 'recurring'
    description?: string
    type?: string
    requested: number
    final: number
  }>
  rankInCommittee: number
  committeeSize: number
}

export const perRso = (a: Allocations, name: string): RsoDetail | null => {
  const annual = a.annual.filter((r) => r.rso === name)
  const recurring = a.recurring.filter((r) => r.rso === name)
  if (annual.length === 0 && recurring.length === 0) return null

  const committee = (annual[0]?.committee || recurring[0]?.committee) as Committee

  const totals = {
    annual: sumFinal(annual),
    recurring: sumFinal(recurring),
    total: sumFinal(annual) + sumFinal(recurring),
  }

  const inCommittee = [...rsoTotals(a).values()]
    .filter((r) => r.committee === committee && r.total > 0)
    .sort((x, y) => y.total - x.total)
  const rank = inCommittee.findIndex((r) => r.rso === name) + 1

  const requests = [
    ...annual.map((r) => ({
      kind: 'annual' as const,
      requested: r.requested,
      final: r.final,
    })),
    ...recurring.map((r) => ({
      kind: 'recurring' as const,
      description: r.description,
      type: r.type,
      requested: r.requested,
      final: r.final,
    })),
  ]

  return {
    rso: name,
    committee,
    totals,
    requests,
    rankInCommittee: rank,
    committeeSize: inCommittee.length,
  }
}

export const allRsoNames = (a: Allocations): string[] => {
  const names = new Set<string>()
  for (const r of a.annual) names.add(r.rso)
  for (const r of a.recurring) names.add(r.rso)
  return [...names].sort((x, y) => x.localeCompare(y))
}

export type RsoFunding = {
  rso: string
  committee: Committee
  requested: number
  funded: number
  gap: number
  ratio: number
}

export const rsoRequestedFunded = (a: Allocations): RsoFunding[] => {
  const map = new Map<string, RsoFunding>()
  const bump = (rso: string, committee: Committee, req: number, fin: number) => {
    let entry = map.get(rso)
    if (!entry) {
      entry = { rso, committee, requested: 0, funded: 0, gap: 0, ratio: 0 }
      map.set(rso, entry)
    }
    entry.requested += req
    entry.funded += fin
  }
  for (const r of a.annual) bump(r.rso, r.committee, r.requested, r.final)
  for (const r of a.recurring) bump(r.rso, r.committee, r.requested, r.final)
  for (const entry of map.values()) {
    entry.gap = entry.requested - entry.funded
    entry.ratio = entry.requested > 0 ? entry.funded / entry.requested : 0
  }
  return [...map.values()].filter((r) => r.requested > 0)
}
