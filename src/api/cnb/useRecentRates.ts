import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'

import type { CnbDailyFixing } from './types'
import { dailyAtQueryOptions, recentCnbDates } from './queries'

export function useRecentRates(businessDays: number = 30) {
  const calendarDays = Math.ceil(businessDays * 1.6) + 3
  const dates = useMemo(() => recentCnbDates(calendarDays), [calendarDays])

  const results = useQueries({
    queries: dates.map(dailyAtQueryOptions),
  })

  const dataKey = results
    .map(result => result.data?.date ?? '')
    .filter(Boolean)
    .join('|')
  const data = useMemo(() => {
    const byDate = new Map<string, CnbDailyFixing>()
    for (const result of results) {
      if (result.data) byDate.set(result.data.date, result.data)
    }
    return Array.from(byDate.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-businessDays)
  }, [businessDays, dataKey])

  const firstError = results.find(r => r.isError)?.error

  return {
    data,
    error: firstError,
    isError: Boolean(firstError) && data.length === 0,
    isFetching: results.some(r => r.isFetching),
    isLoading: data.length === 0 && results.some(r => r.isLoading),
    isPending: data.length === 0 && results.some(r => r.isPending),
    isPlaceholderData: false,
  }
}
