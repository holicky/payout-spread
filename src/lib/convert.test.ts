import type { CurrencyRate } from '../api/cnb/types'
import {
  convertCurrency,
  CZK_RATE,
  czkToForeign,
  foreignToCzk,
} from './convert'

const usd: CurrencyRate = {
  country: 'USA',
  currencyName: 'dollar',
  amount: 1,
  code: 'USD',
  rate: 23.5,
}

const jpy: CurrencyRate = {
  country: 'Japan',
  currencyName: 'yen',
  amount: 100,
  code: 'JPY',
  rate: 15.123,
}

const idr: CurrencyRate = {
  country: 'Indonesia',
  currencyName: 'rupiah',
  amount: 1000,
  code: 'IDR',
  rate: 1.4,
}

describe('czkToForeign', () => {
  it('converts using a 1-unit quote', () => {
    expect(czkToForeign(235, usd)).toBeCloseTo(10, 8)
  })

  it('converts using a 100-unit quote (JPY)', () => {
    // 100 CZK -> 100 * 100 / 15.123 JPY
    expect(czkToForeign(100, jpy)).toBeCloseTo(661.244, 3)
  })

  it('converts using a 1000-unit quote (IDR)', () => {
    // 14 CZK -> 14 * 1000 / 1.4 = 10000 IDR
    expect(czkToForeign(14, idr)).toBeCloseTo(10000, 6)
  })

  it('returns 0 when input is 0', () => {
    expect(czkToForeign(0, usd)).toBe(0)
  })
})

describe('convertCurrency', () => {
  it('is identity when source and target match', () => {
    expect(convertCurrency(100, usd, usd)).toBe(100)
    expect(convertCurrency(50, CZK_RATE, CZK_RATE)).toBe(50)
  })

  it('handles CZK -> foreign (degenerate via CZK_RATE)', () => {
    // 235 CZK -> USD at rate 23.5 -> 10 USD
    expect(convertCurrency(235, CZK_RATE, usd)).toBeCloseTo(10, 8)
  })

  it('handles foreign -> CZK (degenerate via CZK_RATE)', () => {
    // 10 USD -> CZK at rate 23.5 -> 235 CZK
    expect(convertCurrency(10, usd, CZK_RATE)).toBeCloseTo(235, 8)
  })

  it('pivots foreign -> foreign through CZK (USD -> JPY)', () => {
    // 10 USD -> 235 CZK -> 235 / 15.123 * 100 ≈ 1553.9245 JPY
    expect(convertCurrency(10, usd, jpy)).toBeCloseTo(1553.9245, 3)
  })

  it('round-trips USD -> JPY -> USD', () => {
    const out = convertCurrency(convertCurrency(7.5, usd, jpy), jpy, usd)
    expect(out).toBeCloseTo(7.5, 6)
  })
})

describe('foreignToCzk', () => {
  it('is the inverse of czkToForeign', () => {
    const original = 1234.56
    const round = foreignToCzk(czkToForeign(original, jpy), jpy)
    expect(round).toBeCloseTo(original, 6)
  })

  it('converts 100 JPY to its CZK rate', () => {
    expect(foreignToCzk(100, jpy)).toBeCloseTo(15.123, 6)
  })

  it('converts 1000 IDR to its CZK rate', () => {
    expect(foreignToCzk(1000, idr)).toBeCloseTo(1.4, 6)
  })
})
