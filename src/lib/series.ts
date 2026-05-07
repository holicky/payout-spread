import type { CnbDailyFixing, CurrencyRate } from '../api/cnb/types'
import { convertCurrency, CZK_RATE } from './convert'
import { formatLongDate } from './format'

export type ChartPoint = {
  value: number
  label: string
}

export function buildSeries(
  fixings: CnbDailyFixing[],
  sourceCode: string,
  targetCode: string,
  amount: number | null,
): ChartPoint[] {
  return fixings.map(f => {
    const src = rateOf(f, sourceCode)
    const tgt = rateOf(f, targetCode)
    const value =
      src && tgt && amount != null ? convertCurrency(amount, src, tgt) : 0
    return { value, label: formatLongDate(f.date) }
  })
}

function rateOf(f: CnbDailyFixing, code: string): CurrencyRate | undefined {
  if (code === 'CZK') return CZK_RATE
  return f.rates.find(r => r.code === code)
}
