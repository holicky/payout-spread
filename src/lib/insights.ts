import type { CNBDailyFixing } from '../api/cnb/types'
import { convertCurrency, findRate } from './convert'

export type Confidence = 'low' | 'medium' | 'high'

export type WeekdayInsight = {
  weekday: number // 0..6 (getDay convention)
  weekdayName: string
  /** Number of weeks where this weekday produced the best rate of the week. */
  winCount: number
  /** Total weeks where the winner could be determined (≥2 days observed). */
  weeksConsidered: number
  /** winCount / weeksConsidered */
  winRate: number
  /** Expected win rate under uniform null (1 / number of distinct weekdays seen). */
  baselineRate: number
  /** p-value from the multinomial-max significance test. */
  pValue: number
  confidence: Confidence
}

export type MonthPartInsight = {
  part: 'early' | 'mid' | 'late'
  partLabel: string
  winCount: number
  monthsConsidered: number
  winRate: number
  baselineRate: number
  pValue: number
  confidence: Confidence
}

export type InsightOptions = {
  /** Reject results with p-value strictly above this (default 0.05). */
  pValueThreshold?: number
  /** Monte-Carlo iteration count for the significance test (default 1000). */
  permutations?: number
  /** RNG used by the simulation; pass a seeded PRNG for deterministic tests. */
  rng?: () => number
}

// Threshold of 1 means "always surface the mode" — confidence below carries the
// caveat. Callers that want a strict significance gate can pass a lower value.
const DEFAULT_OPTIONS: Required<InsightOptions> = {
  pValueThreshold: 1,
  permutations: 1000,
  rng: Math.random,
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

const MONTH_PARTS: MonthPartInsight['part'][] = ['early', 'mid', 'late']

export function bestWeekday(
  fixings: CNBDailyFixing[],
  sourceCode: string,
  targetCode: string,
  options?: InsightOptions,
): WeekdayInsight | null {
  if (sourceCode === targetCode) return null
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // For each week, find the weekday whose rate was the highest of that week.
  const winners = perGroupWinners(fixings, sourceCode, targetCode, {
    groupKey: f => weekStart(f.date),
    bucketKey: f => weekdayOf(f.date),
  })
  const result = pickMode(winners, distinctWeekdayBuckets(fixings), opts)
  if (!result) return null

  return {
    weekday: result.key,
    weekdayName: WEEKDAYS[result.key]!,
    winCount: result.winCount,
    weeksConsidered: result.totalGroups,
    winRate: result.winRate,
    baselineRate: result.baselineRate,
    pValue: result.pValue,
    confidence: result.confidence,
  }
}

export function bestPartOfMonth(
  fixings: CNBDailyFixing[],
  sourceCode: string,
  targetCode: string,
  options?: InsightOptions,
): MonthPartInsight | null {
  if (sourceCode === targetCode) return null
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const winners = perGroupWinners(fixings, sourceCode, targetCode, {
    groupKey: f => monthKey(f.date),
    bucketKey: f => MONTH_PARTS.indexOf(partOf(f.date)),
  })
  const result = pickMode(winners, MONTH_PARTS.length, opts)
  if (!result) return null

  return {
    part: MONTH_PARTS[result.key]!,
    partLabel: PART_LABELS[MONTH_PARTS[result.key]!],
    winCount: result.winCount,
    monthsConsidered: result.totalGroups,
    winRate: result.winRate,
    baselineRate: result.baselineRate,
    pValue: result.pValue,
    confidence: result.confidence,
  }
}

type WinnerStats = {
  key: number
  winCount: number
  totalGroups: number
  winRate: number
  baselineRate: number
  pValue: number
  confidence: Confidence
}

function pickMode(
  winners: number[],
  bucketCount: number,
  opts: Required<InsightOptions>,
): WinnerStats | null {
  if (winners.length === 0 || bucketCount === 0) return null

  const counts = new Map<number, number>()
  for (const w of winners) counts.set(w, (counts.get(w) ?? 0) + 1)

  let bestKey: number | null = null
  let bestCount = 0
  for (const [key, count] of counts) {
    if (count > bestCount) {
      bestCount = count
      bestKey = key
    }
  }
  if (bestKey == null) return null

  const totalGroups = winners.length
  const baselineRate = 1 / bucketCount
  const pValue = multinomialMaxPValue(
    bestCount,
    totalGroups,
    bucketCount,
    opts.permutations,
    opts.rng,
  )
  if (pValue > opts.pValueThreshold) return null

  return {
    key: bestKey,
    winCount: bestCount,
    totalGroups,
    winRate: bestCount / totalGroups,
    baselineRate,
    pValue,
    confidence: pValueToConfidence(pValue),
  }
}

type GroupingOptions = {
  groupKey: (fixing: CNBDailyFixing) => string
  bucketKey: (fixing: CNBDailyFixing) => number
}

function perGroupWinners(
  fixings: CNBDailyFixing[],
  sourceCode: string,
  targetCode: string,
  { groupKey, bucketKey }: GroupingOptions,
): number[] {
  const groups = new Map<string, Array<{ ratio: number; bucket: number }>>()
  for (const fixing of fixings) {
    const source = findRate(fixing.rates, sourceCode)
    const target = findRate(fixing.rates, targetCode)
    if (!source || !target) continue
    const ratio = convertCurrency(1, source, target)
    const bucket = bucketKey(fixing)
    if (bucket < 0) continue
    const key = groupKey(fixing)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push({ ratio, bucket })
  }

  const winners: number[] = []
  for (const points of groups.values()) {
    if (points.length < 2) continue // can't pick a meaningful winner
    let bestRatio = -Infinity
    let bestBucket = -1
    for (const p of points) {
      if (p.ratio > bestRatio) {
        bestRatio = p.ratio
        bestBucket = p.bucket
      }
    }
    if (bestBucket >= 0) winners.push(bestBucket)
  }
  return winners
}

function distinctWeekdayBuckets(fixings: CNBDailyFixing[]): number {
  const seen = new Set<number>()
  for (const fixing of fixings) seen.add(weekdayOf(fixing.date))
  return seen.size || 5
}

function multinomialMaxPValue(
  observedMaxCount: number,
  trials: number,
  buckets: number,
  permutations: number,
  rng: () => number,
): number {
  if (trials === 0 || buckets === 0) return 1
  let exceedances = 0
  const counts = new Array<number>(buckets).fill(0)
  for (let perm = 0; perm < permutations; perm++) {
    counts.fill(0)
    for (let t = 0; t < trials; t++) {
      const b = Math.floor(rng() * buckets)
      counts[b]!++
    }
    let maxCount = 0
    for (let b = 0; b < buckets; b++) {
      if (counts[b]! > maxCount) maxCount = counts[b]!
    }
    if (maxCount >= observedMaxCount) exceedances++
  }
  // +1 finite-permutation correction so p never reports as exactly 0.
  return (exceedances + 1) / (permutations + 1)
}

function pValueToConfidence(p: number): Confidence {
  if (p < 0.05) return 'high'
  if (p < 0.2) return 'medium'
  return 'low'
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

function monthKey(iso: string): string {
  return iso.slice(0, 7) // 'YYYY-MM'
}

// Group dates by Monday-of-the-week, returned as 'YYYY-MM-DD' of that Monday.
// CNB only publishes weekdays so we never see Sun/Sat fixings — the offset
// math still works for them (would also map to that week's Monday).
function weekStart(iso: string): string {
  const date = localDateFromIso(iso)
  const offsetToMonday = (date.getDay() + 6) % 7 // Mon=0..Sun=6
  date.setDate(date.getDate() - offsetToMonday)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
