import { useMemo } from 'react'

import type { CNBDailyFixing, CurrencyRate } from '../api/cnb/types'
import { CZK_RATE } from '../lib/convert'

export function useRatesWithCZK(
  data: CNBDailyFixing | undefined,
): CurrencyRate[] {
  return useMemo(() => (data ? [CZK_RATE, ...data.rates] : []), [data])
}
