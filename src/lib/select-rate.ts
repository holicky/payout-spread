import type { CurrencyRate } from '../api/cnb/types'

/**
 * Resolve a preferred currency by code, falling back to a second choice and
 * then to the first available rate. Returns undefined only when the rate list
 * is empty or missing.
 */
export function selectRate(
  rates: CurrencyRate[] | undefined,
  code: string,
  fallbackCode: string = 'EUR',
): CurrencyRate | undefined {
  if (!rates || rates.length === 0) return undefined
  return (
    rates.find(rate => rate.code === code) ??
    rates.find(rate => rate.code === fallbackCode) ??
    rates[0]
  )
}
