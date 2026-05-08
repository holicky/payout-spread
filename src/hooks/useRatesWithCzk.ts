import { useMemo } from 'react'

import type { CnbDailyFixing, CurrencyRate } from '../api/cnb/types'
import { CZK_RATE } from '../lib/convert'

export function useRatesWithCzk(
  data: CnbDailyFixing | undefined,
): CurrencyRate[] {
  return useMemo(() => (data ? [CZK_RATE, ...data.rates] : []), [data])
}
