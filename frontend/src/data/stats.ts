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

export type Allocations = {
  annual: AnnualRow[]
  recurring: RecurringRow[]
}

export const COMMITTEES: Committee[] = ['sgfc', 'pcc', 'cat', 'scf', 'csf']

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

export const approvalRate = (a: Allocations) => {
  const req = totalRequested(a)
  return req > 0 ? totalAllocated(a) / req : 0
}

export type GrantHit = {
  rso: string
  committee: Committee
  amount: number
  source: 'annual' | 'recurring'
  description?: string
}

export const biggestGrant = (a: Allocations): GrantHit | null => {
  let best: GrantHit | null = null
  for (const r of a.annual) {
    if (best === null || r.final > best.amount) {
      best = { rso: r.rso, committee: r.committee, amount: r.final, source: 'annual' }
    }
  }
  for (const r of a.recurring) {
    if (best === null || r.final > best.amount) {
      best = {
        rso: r.rso,
        committee: r.committee,
        amount: r.final,
        source: 'recurring',
        description: r.description,
      }
    }
  }
  return best
}

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

export const perCommittee = (a: Allocations, c: Committee): CommitteeStats => {
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
    .slice(0, 5)

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
