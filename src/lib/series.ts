import type { CNBDailyFixing } from '../api/cnb/types'
import { convertCurrency, findRate } from './convert'
import { formatLongDateWithWeekday } from './format'

export type ChartPoint = {
  value: number
  label: string
}

export function buildSeries(
  fixings: CNBDailyFixing[],
  sourceCode: string,
  targetCode: string,
  amount: number | null,
): ChartPoint[] {
  return fixings.map(fixing => {
    const source = findRate(fixing.rates, sourceCode)
    const target = findRate(fixing.rates, targetCode)
    const value =
      source && target && amount != null
        ? convertCurrency(amount, source, target)
        : 0
    return { value, label: formatLongDateWithWeekday(fixing.date) }
  })
}
