import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import type {
  Allocations,
  AnnualRow,
  BudgetRow,
  Committee,
  RecurringRow,
} from './stats'

type RawAnnual = {
  'RSO Name': string
  Committee: Committee
  Requested: string
  'Final Allocation': string
}

type RawRecurring = RawAnnual & {
  'Request Description': string
  Type: string
}

type RawBudget = {
  Account: string
  'Beginning Balance': string
  'Allocated 25-26': string
  'Expenditures 25-26': string
  'Ending Balance': string
  'Allocated 26-27': string
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

export const useAllocations = () => {
  const [data, setData] = useState<Allocations | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      parseCsv<RawAnnual>('/annual_allocations.csv'),
      parseCsv<RawRecurring>('/yearly_allocations.csv'),
      parseCsv<RawBudget>('/budget.csv'),
    ])
      .then(([rawAnnual, rawRecurring, rawBudget]) => {
        if (cancelled) return
        const annual: AnnualRow[] = rawAnnual
          .filter((r) => r['RSO Name'])
          .map((r) => ({
            rso: r['RSO Name'].trim(),
            committee: r.Committee,
            requested: toNumber(r.Requested),
            final: toNumber(r['Final Allocation']),
          }))
        const recurring: RecurringRow[] = rawRecurring
          .filter((r) => r['RSO Name'])
          .map((r) => ({
            rso: r['RSO Name'].trim(),
            committee: r.Committee,
            requested: toNumber(r.Requested),
            final: toNumber(r['Final Allocation']),
            description: (r['Request Description'] || '').trim(),
            type: (r.Type || '').trim(),
          }))
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
        setData({ annual, recurring, budget })
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, error }
}
