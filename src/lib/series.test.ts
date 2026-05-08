import type { CNBDailyFixing } from '../api/cnb/types'
import { buildSeries } from './series'

const usd = {
  country: 'USA',
  currencyName: 'dollar',
  amount: 1,
  code: 'USD',
  rate: 23.5,
}

const eur = {
  country: 'EMU',
  currencyName: 'euro',
  amount: 1,
  code: 'EUR',
  rate: 25.0,
}

const fixings: CNBDailyFixing[] = [
  { date: '2026-05-05', sequenceNumber: 85, rates: [usd, eur] },
  {
    date: '2026-05-06',
    sequenceNumber: 86,
    rates: [usd, { ...eur, rate: 25.5 }],
  },
  { date: '2026-05-07', sequenceNumber: 87, rates: [usd] }, // EUR missing
]

describe('buildSeries', () => {
  it('returns one point per fixing in input order', () => {
    expect(buildSeries(fixings, 'USD', 'CZK', 100)).toHaveLength(3)
  })

  it('projects foreign -> CZK at each fixing', () => {
    const series = buildSeries(fixings, 'EUR', 'CZK', 10)
    expect(series[0].value).toBeCloseTo(250, 6)
    expect(series[1].value).toBeCloseTo(255, 6)
  })

  it('projects CZK -> foreign at each fixing', () => {
    // 100 CZK at USD rate 23.5 -> 100/23.5 ≈ 4.2553 USD
    const series = buildSeries(fixings, 'CZK', 'USD', 100)
    expect(series[0].value).toBeCloseTo(4.2553, 4)
  })

  it('projects foreign -> foreign via CZK pivot', () => {
    // 10 USD on day 1: 10 * 23.5 = 235 CZK; / 25.0 = 9.4 EUR
    const series = buildSeries(fixings, 'USD', 'EUR', 10)
    expect(series[0].value).toBeCloseTo(9.4, 6)
  })

  it('returns identity when source equals target', () => {
    const series = buildSeries(fixings, 'USD', 'USD', 7.5)
    expect(series.every(p => p.value === 7.5)).toBe(true)
  })

  it('uses long-form labels (DD MMM YYYY)', () => {
    const series = buildSeries(fixings, 'USD', 'CZK', 1)
    expect(series.map(p => p.label)).toEqual([
      '05 May 2026',
      '06 May 2026',
      '07 May 2026',
    ])
  })

  it('emits 0 when either side is missing on that day', () => {
    const series = buildSeries(fixings, 'EUR', 'CZK', 10)
    expect(series[2].value).toBe(0)
  })

  it('emits 0 when amount is null', () => {
    const series = buildSeries(fixings, 'USD', 'CZK', null)
    expect(series.every(p => p.value === 0)).toBe(true)
  })
})
