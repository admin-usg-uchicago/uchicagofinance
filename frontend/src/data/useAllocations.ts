import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import type {
  Allocations,
  AnnualRow,
  AwardRow,
  BudgetRow,
  Committee,
  ExpenditureRow,
  RecurringRow,
} from './stats'
import { cycleBySlug, type CycleSlug } from './cycles'

type RawAnnual = {
  'RSO Name'?: string
  Committee?: string
  Requested?: string
  'Requested Allocation'?: string
  'Final Allocation'?: string
}

type RawRecurring = RawAnnual & {
  'Request Description'?: string
  Type?: string
}

const committeeFromLabel = (raw: string | undefined): Committee | null => {
  if (!raw) return null
  const k = raw.trim().toLowerCase()
  if (!k || k === 'total') return null
  // Already a short code (legacy format)
  if (k === 'cat' || k === 'csf' || k === 'pcc' || k === 'scf' || k === 'sgfc') {
    return k as Committee
  }
  // Match full labels (and tolerate the misspellings seen in source data)
  if (k.includes('academic team')) return 'cat'
  if (k.includes('community service')) return 'csf'
  if (k.includes('coordinating council')) return 'pcc'
  if (k.includes('sports club')) return 'scf'
  if (k.includes('government finance')) return 'sgfc'
  return null
}

type RawBudget = {
  Account: string
  'Beginning Balance': string
  'Allocated 25-26': string
  'Expenditures 25-26': string
  'Ending Balance': string
  'Allocated 26-27': string
}

type RawAward = {
  'RSO Name': string
  Award: string
  Description: string
}

type RawExpenditure = {
  Division: string
  Category: string
  Description: string
  Amount: string
}

const toNumber = (s: string | number | undefined | null): number => {
  if (typeof s === 'number') return s
  if (!s) return 0
  const cleaned = String(s).replace(/[$,\s]/g, '')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}

const parseCsv = <T,>(path: string): Promise<T[]> =>
  new Promise((resolve, reject) => {
    Papa.parse<T>(path, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err: Error) => reject(err),
    })
  })

const empty = <T,>(): Promise<T[]> => Promise.resolve([])

export const useAllocations = (slug: CycleSlug) => {
  const [data, setData] = useState<Allocations | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    setData(null)
    setError(null)
    const cycle = cycleBySlug(slug)
    const base = `/cycles/${cycle.slug}`

    Promise.all([
      cycle.hasAnnual ? parseCsv<RawAnnual>(`${base}/annual_allocations.csv`) : empty<RawAnnual>(),
      cycle.hasRecurring ? parseCsv<RawRecurring>(`${base}/yearly_allocations.csv`) : empty<RawRecurring>(),
      cycle.hasBudget ? parseCsv<RawBudget>(`${base}/budget.csv`) : empty<RawBudget>(),
      cycle.hasAwards ? parseCsv<RawAward>(`${base}/awards.csv`) : empty<RawAward>(),
      cycle.hasExpenditures
        ? parseCsv<RawExpenditure>(`${base}/expenditures.csv`)
        : empty<RawExpenditure>(),
    ])
      .then(([rawAnnual, rawRecurring, rawBudget, rawAwards, rawExpenditures]) => {
        if (cancelled) return
        const annual: AnnualRow[] = rawAnnual
          .map((r) => {
            const rso = (r['RSO Name'] || '').trim()
            const committee = committeeFromLabel(r.Committee)
            if (!rso || !committee) return null
            return {
              rso,
              committee,
              requested: toNumber(r['Requested Allocation'] ?? r.Requested),
              final: toNumber(r['Final Allocation']),
            }
          })
          .filter((r): r is AnnualRow => r !== null)
        const recurring: RecurringRow[] = rawRecurring
          .map((r) => {
            const rso = (r['RSO Name'] || '').trim()
            const committee = committeeFromLabel(r.Committee)
            if (!rso || !committee) return null
            return {
              rso,
              committee,
              requested: toNumber(r['Requested Allocation'] ?? r.Requested),
              final: toNumber(r['Final Allocation']),
              description: (r['Request Description'] || '').trim(),
              type: (r.Type || '').trim(),
            }
          })
          .filter((r): r is RecurringRow => r !== null)
        const budget: BudgetRow[] = rawBudget
          .filter((r) => r.Account)
          .map((r) => ({
            account: r.Account.trim(),
            beginningBalance: toNumber(r['Beginning Balance']),
            allocated2526: toNumber(r['Allocated 25-26']),
            expenditures2526: toNumber(r['Expenditures 25-26']),
            endingBalance: toNumber(r['Ending Balance']),
            allocated2627: toNumber(r['Allocated 26-27']),
          }))
        const awards: AwardRow[] = rawAwards
          .filter((r) => r['RSO Name'])
          .map((r) => ({
            rso: r['RSO Name'].trim(),
            award: (r.Award || '').trim(),
            description: (r.Description || '').trim(),
          }))
        const expenditures: ExpenditureRow[] = rawExpenditures
          .filter((r) => r.Division)
          .map((r) => ({
            division: r.Division.trim(),
            category: (r.Category || '').trim(),
            description: (r.Description || '').trim(),
            amount: toNumber(r.Amount),
          }))
        setData({ annual, recurring, budget, awards, expenditures })
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  return { data, error }
}
