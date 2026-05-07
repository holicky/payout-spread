import { useMemo } from 'react'

import type { CurrencyRate } from '../api/cnb/types'

export function useSelectedRate(
  rates: CurrencyRate[] | undefined,
  code: string,
  fallbackCode: string = 'EUR',
): CurrencyRate | undefined {
  return useMemo(() => {
    if (!rates || rates.length === 0) return undefined
    return (
      rates.find(r => r.code === code) ??
      rates.find(r => r.code === fallbackCode) ??
      rates[0]
    )
  }, [rates, code, fallbackCode])
}
