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
  return Array.from({ length: calendarDays }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    return d
  })
}

function msUntilNextCnbPublish(now = new Date()): number {
  const next = new Date(now)
  next.setHours(CNB_PUBLISH_HOUR, CNB_PUBLISH_MINUTE, 0, 0)

  if (now >= next || isWeekend(next)) {
    do {
      next.setDate(next.getDate() + 1)
      next.setHours(CNB_PUBLISH_HOUR, CNB_PUBLISH_MINUTE, 0, 0)
    } while (isWeekend(next))
  }

  return Math.max(60_000, next.getTime() - now.getTime())
}

function isToday(date: Date): boolean {
  return formatCnbDate(date) === formatCnbDate(new Date())
}

function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}
