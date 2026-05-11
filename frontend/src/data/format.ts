const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const compactFmt = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const percentFmt = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 0,
})

const integerFmt = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

export const currency = (n: number) => currencyFmt.format(Math.round(n))
export const currencyCompact = (n: number) => '$' + compactFmt.format(n)
export const percent = (n: number) => percentFmt.format(n)
export const integer = (n: number) => integerFmt.format(Math.round(n))
