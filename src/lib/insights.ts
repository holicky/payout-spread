import type { CnbDailyFixing } from '../api/cnb/types'
import { convertCurrency, findRate } from './convert'

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
  const buckets = bucket(fixings, sourceCode, targetCode, fixing =>
    weekdayOf(fixing.date),
  )
  const best = pickBest(buckets)
  if (!best) return null
  const { key, ...stats } = best
  return { weekday: key, weekdayName: WEEKDAYS[key]!, ...stats }
}

export function bestPartOfMonth(
  fixings: CnbDailyFixing[],
  sourceCode: string,
  targetCode: string,
): MonthPartInsight | null {
  if (sourceCode === targetCode) return null
  const buckets = bucket(fixings, sourceCode, targetCode, fixing =>
    partOf(fixing.date),
  )
  const best = pickBest(buckets)
  if (!best) return null
  const { key, ...stats } = best
  return { part: key, partLabel: PART_LABELS[key], ...stats }
}

function bucket<K>(
  fixings: CnbDailyFixing[],
  sourceCode: string,
  targetCode: string,
  keyFn: (fixing: CnbDailyFixing) => K,
): Map<K, number[]> {
  const out = new Map<K, number[]>()
  for (const fixing of fixings) {
    const source = findRate(fixing.rates, sourceCode)
    const target = findRate(fixing.rates, targetCode)
    if (!source || !target) continue
    const key = keyFn(fixing)
    const ratio = convertCurrency(1, source, target)
    if (!out.has(key)) out.set(key, [])
    out.get(key)!.push(ratio)
  }
  return out
}

type BucketStats<K> = {
  key: K
  avgRatio: number
  advantagePercent: number
  sampleSize: number
  confidence: Confidence
}

function pickBest<K>(buckets: Map<K, number[]>): BucketStats<K> | null {
  if (buckets.size === 0) return null
  const allRatios = Array.from(buckets.values()).flat()
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
    key: bestKey,
    avgRatio: bestAvg,
    advantagePercent: ((bestAvg - overallMean) / overallMean) * 100,
    sampleSize: bestSize,
    confidence: confidenceFromSize(bestSize),
  }
}

function mean(values: number[]): number {
  let sum = 0
  for (const value of values) sum += value
  return sum / values.length
}

function confidenceFromSize(sampleSize: number): Confidence {
  if (sampleSize < 5) return 'low'
  if (sampleSize < 12) return 'medium'
  return 'high'
}

function localDateFromIso(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year!, month! - 1, day!)
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
