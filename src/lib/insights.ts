import type { CnbDailyFixing, CurrencyRate } from '../api/cnb/types'
import { convertCurrency, CZK_RATE } from './convert'

export type Confidence = 'low' | 'medium' | 'high'

export type WeekdayInsight = {
  weekday: number // 1..5 (Mon..Fri) — CNB only publishes business days
  weekdayName: string
  /** Conversion ratio: 1 unit source → this much target on average. */
  avgRatio: number
  /** Percent advantage vs the mean ratio across all weekdays in the window. */
  advantagePercent: number
  sampleSize: number
  confidence: Confidence
}

export type MonthPartInsight = {
  part: 'early' | 'mid' | 'late'
  partLabel: string
  avgRatio: number
  advantagePercent: number
  sampleSize: number
  confidence: Confidence
}

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const PART_LABELS: Record<MonthPartInsight['part'], string> = {
  early: 'Early month (1–10)',
  mid: 'Mid month (11–20)',
  late: 'Late month (21–31)',
}

export function bestWeekday(
  fixings: CnbDailyFixing[],
  sourceCode: string,
  targetCode: string,
): WeekdayInsight | null {
  if (sourceCode === targetCode) return null
  const buckets = bucket(fixings, sourceCode, targetCode, f =>
    weekdayOf(f.date),
  )
  return pickBest(buckets, day => ({
    weekday: day,
    weekdayName: WEEKDAYS[day]!,
  }))
}

export function bestPartOfMonth(
  fixings: CnbDailyFixing[],
  sourceCode: string,
  targetCode: string,
): MonthPartInsight | null {
  if (sourceCode === targetCode) return null
  const buckets = bucket(fixings, sourceCode, targetCode, f => partOf(f.date))
  return pickBest(buckets, part => ({
    part,
    partLabel: PART_LABELS[part],
  }))
}

function bucket<K>(
  fixings: CnbDailyFixing[],
  sourceCode: string,
  targetCode: string,
  keyFn: (f: CnbDailyFixing) => K,
): Map<K, number[]> {
  const out = new Map<K, number[]>()
  for (const f of fixings) {
    const src = rateOf(f, sourceCode)
    const tgt = rateOf(f, targetCode)
    if (!src || !tgt) continue
    const key = keyFn(f)
    const ratio = convertCurrency(1, src, tgt)
    if (!out.has(key)) out.set(key, [])
    out.get(key)!.push(ratio)
  }
  return out
}

function rateOf(f: CnbDailyFixing, code: string): CurrencyRate | undefined {
  if (code === 'CZK') return CZK_RATE
  return f.rates.find(r => r.code === code)
}

function pickBest<K extends string | number, Extra>(
  buckets: Map<K, number[]>,
  describe: (key: K) => Extra,
):
  | (Extra & {
      avgRatio: number
      advantagePercent: number
      sampleSize: number
      confidence: Confidence
    })
  | null {
  if (buckets.size === 0) return null

  const allRatios: number[] = []
  for (const arr of buckets.values()) allRatios.push(...arr)
  if (allRatios.length === 0) return null
  const overallMean = mean(allRatios)

  let bestKey: K | null = null
  let bestAvg = -Infinity
  let bestSize = 0
  for (const [key, ratios] of buckets) {
    const avg = mean(ratios)
    if (avg > bestAvg) {
      bestAvg = avg
      bestKey = key
      bestSize = ratios.length
    }
  }
  if (bestKey == null) return null

  return {
    ...describe(bestKey),
    avgRatio: bestAvg,
    advantagePercent: ((bestAvg - overallMean) / overallMean) * 100,
    sampleSize: bestSize,
    confidence: confidenceFromSize(bestSize),
  }
}

function mean(xs: number[]): number {
  let sum = 0
  for (const x of xs) sum += x
  return sum / xs.length
}

function confidenceFromSize(n: number): Confidence {
  if (n < 5) return 'low'
  if (n < 12) return 'medium'
  return 'high'
}

function localDateFromIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

function weekdayOf(iso: string): number {
  return localDateFromIso(iso).getDay()
}

function partOf(iso: string): MonthPartInsight['part'] {
  const day = localDateFromIso(iso).getDate()
  if (day <= 10) return 'early'
  if (day <= 20) return 'mid'
  return 'late'
}
