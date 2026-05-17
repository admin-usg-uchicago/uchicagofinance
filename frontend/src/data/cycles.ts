export type CycleSlug = '2025-26' | '2026-27'

export type Cycle = {
  slug: CycleSlug
  label: string
  short: string
  tag: string | null
  hasAnnual: boolean
  hasRecurring: boolean
  hasBudget: boolean
  hasAwards: boolean
  hasExpenditures: boolean
}

export const CYCLES: readonly Cycle[] = [
  {
    slug: '2025-26',
    label: 'FY 2025–26',
    short: '25–26',
    tag: 'Current',
    hasAnnual: true,
    hasRecurring: true,
    hasBudget: true,
    hasAwards: true,
    hasExpenditures: true,
  },
  {
    slug: '2026-27',
    label: 'FY 2026–27',
    short: '26–27',
    tag: 'In progress',
    hasAnnual: true,
    hasRecurring: false,
    hasBudget: false,
    hasAwards: false,
    hasExpenditures: false,
  },
] as const

export const DEFAULT_CYCLE: CycleSlug = '2025-26'

export const cycleBySlug = (slug: CycleSlug): Cycle =>
  CYCLES.find((c) => c.slug === slug) ?? CYCLES[0]
