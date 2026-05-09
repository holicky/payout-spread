import type { CNBDailyFixing, CurrencyRate } from '../api/cnb/types'
import { bestPartOfMonth, bestWeekday } from './insights'

const usd = (rate: number): CurrencyRate => ({
  country: 'USA',
  currencyName: 'dollar',
  amount: 1,
  code: 'USD',
  rate,
})

const fixing = (date: string, rate: number): CNBDailyFixing => ({
  date,
  sequenceNumber: 1,
  rates: [usd(rate)],
})

// Seeded PRNG so multinomial-max simulations are deterministic across CI runs.
function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const seeded = () => ({ rng: mulberry32(1) })

function isoDate(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// Build a Mon..Fri week starting from `mondayIso`, with one rate per weekday.
function buildWeek(mondayIso: string, rates: number[]): CNBDailyFixing[] {
  const monday = new Date(`${mondayIso}T00:00:00`)
  return rates.map((rate, dayOffset) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + dayOffset)
    return fixing(isoDate(d), rate)
  })
}

// Build N consecutive weeks; ratesForWeekIndex(i) returns the 5 daily rates.
function buildWeeks(
  startMondayIso: string,
  count: number,
  ratesForWeekIndex: (i: number) => number[],
): CNBDailyFixing[] {
  const start = new Date(`${startMondayIso}T00:00:00`)
  const out: CNBDailyFixing[] = []
  for (let i = 0; i < count; i++) {
    const monday = new Date(start)
    monday.setDate(monday.getDate() + i * 7)
    out.push(...buildWeek(isoDate(monday), ratesForWeekIndex(i)))
  }
  return out
}

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

  it('returns null when there are no full weeks', () => {
    // single days from different weeks — no week has ≥2 fixings
    const fixings = [fixing('2026-05-04', 25), fixing('2026-05-11', 30)]
    expect(bestWeekday(fixings, 'USD', 'CZK', seeded())).toBeNull()
  })

  it('picks the weekday that wins the most weeks (clear signal)', () => {
    // 30 weeks where Monday always has the highest CZK/USD rate of the week.
    const fixings = buildWeeks('2026-01-05', 30, () => [25, 20, 20, 20, 20])
    const insight = bestWeekday(fixings, 'USD', 'CZK', seeded())
    expect(insight?.weekdayName).toBe('Monday')
    expect(insight?.winCount).toBe(30)
    expect(insight?.weeksConsidered).toBe(30)
    expect(insight?.winRate).toBe(1)
    expect(insight?.baselineRate).toBeCloseTo(0.2, 6)
    expect(insight?.pValue).toBeLessThan(0.01)
    expect(insight?.confidence).toBe('high')
  })

  it('still surfaces a winner under the loose default but flags it low-confidence (noise)', () => {
    // 30 weeks; the winning weekday cycles Mon→Tue→Wed→Thu→Fri.
    // Each weekday wins exactly 6 times — a uniform multinomial outcome.
    const cycle = [
      [25, 20, 20, 20, 20],
      [20, 25, 20, 20, 20],
      [20, 20, 25, 20, 20],
      [20, 20, 20, 25, 20],
      [20, 20, 20, 20, 25],
    ]
    const fixings = buildWeeks('2026-01-05', 30, i => cycle[i % 5]!)
    const insight = bestWeekday(fixings, 'USD', 'CZK', seeded())
    expect(insight).not.toBeNull()
    expect(insight?.winCount).toBe(6)
    expect(insight?.weeksConsidered).toBe(30)
    expect(insight?.pValue).toBeGreaterThan(0.2)
    expect(insight?.confidence).toBe('low')
  })

  it('returns null on noise when caller passes a strict threshold', () => {
    const cycle = [
      [25, 20, 20, 20, 20],
      [20, 25, 20, 20, 20],
      [20, 20, 25, 20, 20],
      [20, 20, 20, 25, 20],
      [20, 20, 20, 20, 25],
    ]
    const fixings = buildWeeks('2026-01-05', 30, i => cycle[i % 5]!)
    expect(
      bestWeekday(fixings, 'USD', 'CZK', {
        ...seeded(),
        pValueThreshold: 0.05,
      }),
    ).toBeNull()
  })
})

describe('bestPartOfMonth', () => {
  it('returns null when source equals target', () => {
    expect(bestPartOfMonth([fixing('2026-05-15', 22)], 'USD', 'USD')).toBeNull()
  })

  it('returns null when nothing matches', () => {
    expect(bestPartOfMonth([], 'USD', 'CZK')).toBeNull()
  })

  it('picks the month-third that wins the most months (clear signal)', () => {
    // 12 months. In every month, late-month (day 25) has the highest USD rate.
    const fixings: CNBDailyFixing[] = []
    for (let m = 1; m <= 12; m++) {
      const mm = String(m).padStart(2, '0')
      fixings.push(fixing(`2026-${mm}-05`, 20)) // early
      fixings.push(fixing(`2026-${mm}-15`, 20)) // mid
      fixings.push(fixing(`2026-${mm}-25`, 25)) // late wins
    }
    const insight = bestPartOfMonth(fixings, 'USD', 'CZK', seeded())
    expect(insight?.part).toBe('late')
    expect(insight?.winCount).toBe(12)
    expect(insight?.monthsConsidered).toBe(12)
    expect(insight?.winRate).toBe(1)
    expect(insight?.baselineRate).toBeCloseTo(1 / 3, 6)
    expect(insight?.pValue).toBeLessThan(0.01)
    expect(insight?.confidence).toBe('high')
  })

  it('still surfaces a winner under the loose default but flags it low-confidence', () => {
    // 12 months; winning third cycles early → mid → late.
    const winnerByMonth: ('early' | 'mid' | 'late')[] = [
      'early',
      'mid',
      'late',
      'early',
      'mid',
      'late',
      'early',
      'mid',
      'late',
      'early',
      'mid',
      'late',
    ]
    const fixings: CNBDailyFixing[] = []
    for (let m = 1; m <= 12; m++) {
      const mm = String(m).padStart(2, '0')
      const winner = winnerByMonth[m - 1]!
      fixings.push(fixing(`2026-${mm}-05`, winner === 'early' ? 25 : 20))
      fixings.push(fixing(`2026-${mm}-15`, winner === 'mid' ? 25 : 20))
      fixings.push(fixing(`2026-${mm}-25`, winner === 'late' ? 25 : 20))
    }
    const insight = bestPartOfMonth(fixings, 'USD', 'CZK', seeded())
    expect(insight).not.toBeNull()
    expect(insight?.winCount).toBe(4)
    expect(insight?.monthsConsidered).toBe(12)
    expect(insight?.pValue).toBeGreaterThan(0.2)
    expect(insight?.confidence).toBe('low')
  })
})
