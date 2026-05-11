import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import type { Allocations, AnnualRow, Committee, RecurringRow } from './stats'

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
    ])
      .then(([rawAnnual, rawRecurring]) => {
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
        setData({ annual, recurring })
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
