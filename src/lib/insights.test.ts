import type { CnbDailyFixing, CurrencyRate } from '../api/cnb/types'
import { bestPartOfMonth, bestWeekday } from './insights'

const usd = (rate: number): CurrencyRate => ({
  country: 'USA',
  currencyName: 'dollar',
  amount: 1,
  code: 'USD',
  rate,
})

const fixing = (date: string, rate: number): CnbDailyFixing => ({
  date,
  sequenceNumber: 1,
  rates: [usd(rate)],
})

describe('bestWeekday', () => {
  it('returns null when source equals target', () => {
    const fixings = [fixing('2026-05-04', 25)]
    expect(bestWeekday(fixings, 'USD', 'USD')).toBeNull()
    expect(bestWeekday(fixings, 'CZK', 'CZK')).toBeNull()
  })

  it('returns null when no fixings carry both currencies', () => {
    expect(bestWeekday([], 'USD', 'CZK')).toBeNull()
    expect(
      bestWeekday(
        [{ date: '2026-05-04', sequenceNumber: 1, rates: [] }],
        'USD',
        'CZK',
      ),
    ).toBeNull()
  })

  it('picks the weekday with the highest USD->CZK ratio', () => {
    const fixings: CnbDailyFixing[] = [
      fixing('2026-05-04', 25), // Mon
      fixing('2026-05-11', 25), // Mon
      fixing('2026-05-05', 20), // Tue
      fixing('2026-05-12', 20), // Tue
      fixing('2026-05-06', 22), // Wed
      fixing('2026-05-07', 21), // Thu
      fixing('2026-05-08', 19), // Fri
    ]
    const insight = bestWeekday(fixings, 'USD', 'CZK')
    expect(insight?.weekdayName).toBe('Monday')
    expect(insight?.avgRatio).toBe(25)
    expect(insight?.sampleSize).toBe(2)
  })

  it('picks the weekday with the highest CZK->USD ratio (lowest USD price)', () => {
    // CZK->USD ratio = 1/USDrate. Lowest USD rate = highest CZK->USD ratio.
    const fixings: CnbDailyFixing[] = [
      fixing('2026-05-04', 25), // Mon - high USD rate -> low CZK->USD
      fixing('2026-05-05', 20), // Tue - low USD rate -> high CZK->USD
    ]
    const insight = bestWeekday(fixings, 'CZK', 'USD')
    expect(insight?.weekdayName).toBe('Tuesday')
  })

  it('reports advantage vs the overall mean', () => {
    const fixings: CnbDailyFixing[] = [
      fixing('2026-05-04', 22), // Mon
      fixing('2026-05-05', 18), // Tue
    ]
    const insight = bestWeekday(fixings, 'USD', 'CZK')
    // overall mean = 20, best (Mon) = 22 → +10%
    expect(insight?.advantagePercent).toBeCloseTo(10, 6)
  })

  it('grades confidence by sample size', () => {
    const lowFixings: CnbDailyFixing[] = [
      fixing('2026-05-04', 22),
      fixing('2026-05-05', 20),
    ]
    expect(bestWeekday(lowFixings, 'USD', 'CZK')?.confidence).toBe('low')

    const mondayIsoDates = [
      '2026-01-05',
      '2026-01-12',
      '2026-01-19',
      '2026-01-26',
      '2026-02-02',
      '2026-02-09',
      '2026-02-16',
      '2026-02-23',
      '2026-03-02',
      '2026-03-09',
      '2026-03-16',
      '2026-03-23',
    ]
    const mondays = mondayIsoDates.map(d => fixing(d, 25))
    const insight = bestWeekday(mondays, 'USD', 'CZK')
    expect(insight?.weekdayName).toBe('Monday')
    expect(insight?.sampleSize).toBe(12)
    expect(insight?.confidence).toBe('high')
  })
})

describe('bestPartOfMonth', () => {
  it('buckets dates into early / mid / late', () => {
    const fixings: CnbDailyFixing[] = [
      fixing('2026-05-03', 20), // early
      fixing('2026-05-09', 20), // early
      fixing('2026-05-15', 22), // mid
      fixing('2026-05-25', 25), // late
    ]
    const insight = bestPartOfMonth(fixings, 'USD', 'CZK')
    expect(insight?.part).toBe('late')
    expect(insight?.partLabel).toContain('21')
  })

  it('returns null when nothing matches', () => {
    expect(bestPartOfMonth([], 'USD', 'CZK')).toBeNull()
  })

  it('places day 11 into mid (boundary)', () => {
    const fixings = [fixing('2026-05-11', 50), fixing('2026-05-25', 30)]
    const insight = bestPartOfMonth(fixings, 'USD', 'CZK')
    expect(insight?.part).toBe('mid')
  })

  it('returns null when source equals target', () => {
    expect(bestPartOfMonth([fixing('2026-05-15', 22)], 'USD', 'USD')).toBeNull()
  })
})
