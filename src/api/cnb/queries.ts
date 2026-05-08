import { queryOptions } from '@tanstack/react-query'

import {
  CnbFetchError,
  fetchDailyRatesAt,
  fetchRecentDailyRates,
  formatCnbDate,
} from './client'
import { CnbParseError } from './parser'

const CNB_PUBLISH_HOUR = 14
const CNB_PUBLISH_MINUTE = 35

export const dailyAtQueryKey = (date: Date) =>
  ['cnb', 'dailyAt', formatCnbDate(date)] as const

export function dailyAtQueryOptions(date: Date) {
  return queryOptions({
    queryKey: dailyAtQueryKey(date),
    queryFn: ({ signal }) => fetchDailyRatesAt(date, signal),
    staleTime: isToday(date) ? msUntilNextCnbPublish() : Infinity,
    gcTime: 24 * 60 * 60 * 1000,
  })
}

export function aggregateRecentRatesQueryOptions(businessDays: number) {
  return queryOptions({
    queryKey: ['cnb', 'recentAggregate', businessDays] as const,
    queryFn: ({ signal }) => fetchRecentDailyRates(businessDays, signal),
    staleTime: msUntilNextCnbPublish(),
    gcTime: 24 * 60 * 60 * 1000,
  })
}

export function shouldRetryCnbQuery(
  failureCount: number,
  error: unknown,
): boolean {
  if (error instanceof CnbParseError) return false
  if (error instanceof CnbFetchError && error.status && error.status < 500) {
    return false
  }
  return failureCount < 2
}

export function recentCnbDates(calendarDays: number): Date[] {
  const today = new Date()
  return Array.from({ length: calendarDays }, (_, index) => {
    const date = new Date(today)
    date.setDate(date.getDate() - index)
    return date
  })
}

function msUntilNextCnbPublish(now = new Date()): number {
  let next = setPragueTime(now, CNB_PUBLISH_HOUR, CNB_PUBLISH_MINUTE)

  while (next.getTime() <= now.getTime() || isPragueWeekend(next)) {
    // +25h crosses DST safely; setPragueTime then snaps back to 14:35 Prague.
    next = setPragueTime(
      new Date(next.getTime() + 25 * 60 * 60 * 1000),
      CNB_PUBLISH_HOUR,
      CNB_PUBLISH_MINUTE,
    )
  }

  return Math.max(60_000, next.getTime() - now.getTime())
}

function isToday(date: Date): boolean {
  return formatCnbDate(date) === formatCnbDate(new Date())
}

function pragueOffsetMinutes(at: Date): number {
  const pragueIso = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Prague',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(at)
  const [date, time] = pragueIso.split(' ')
  const asUtc = Date.parse(`${date}T${time}Z`)
  return Math.round((asUtc - at.getTime()) / 60_000)
}

function setPragueTime(anchor: Date, hour: number, minute: number): Date {
  const offset = pragueOffsetMinutes(anchor)
  const pragueWall = new Date(anchor.getTime() + offset * 60_000)
  const wallTarget = Date.UTC(
    pragueWall.getUTCFullYear(),
    pragueWall.getUTCMonth(),
    pragueWall.getUTCDate(),
    hour,
    minute,
    0,
    0,
  )
  return new Date(wallTarget - offset * 60_000)
}

function isPragueWeekend(at: Date): boolean {
  const offset = pragueOffsetMinutes(at)
  const pragueWall = new Date(at.getTime() + offset * 60_000)
  const day = pragueWall.getUTCDay()
  return day === 0 || day === 6
}
