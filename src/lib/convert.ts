import type { CurrencyRate } from '../api/cnb/types'

/**
 * A synthetic CZK row so currency math is uniform when CZK is on either side.
 * With rate=1 / amount=1 the existing helpers degenerate to identity for CZK.
 */
export const CZK_RATE: CurrencyRate = {
  country: 'Czech Republic',
  currencyName: 'koruna',
  amount: 1,
  code: 'CZK',
  rate: 1,
}

/**
 * Convert CZK to a foreign currency using a CNB fixing row.
 *
 * CNB quotes `rate` as CZK per `amount` units of foreign currency
 * (e.g. JPY is quoted per 100 JPY). So 1 CZK = amount / rate foreign units.
 */
export function czkToForeign(czk: number, rate: CurrencyRate): number {
  return (czk * rate.amount) / rate.rate
}

/**
 * Inverse: how many CZK does `foreign` units of the foreign currency cost.
 */
export function foreignToCzk(foreign: number, rate: CurrencyRate): number {
  return (foreign * rate.rate) / rate.amount
}

/**
 * Convert any currency to any currency, pivoting through CZK. Use `CZK_RATE`
 * when either side is CZK; the math degenerates to identity in that case.
 */
export function convertCurrency(
  amount: number,
  source: CurrencyRate,
  target: CurrencyRate,
): number {
  if (source.code === target.code) return amount
  const inCzk = foreignToCzk(amount, source)
  return czkToForeign(inCzk, target)
}

/**
 * Look up a rate by code. Returns `CZK_RATE` for "CZK" so call sites can treat
 * CZK uniformly without a separate branch.
 */
export function findRate(
  rates: CurrencyRate[],
  code: string,
): CurrencyRate | undefined {
  if (code === 'CZK') return CZK_RATE
  return rates.find(rate => rate.code === code)
}
