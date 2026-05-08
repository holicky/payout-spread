import { useCallback, useMemo } from 'react'
import { useQueries, type UseQueryResult } from '@tanstack/react-query'

import { calendarDaysFor } from './client'
import { dailyAtQueryOptions, recentCNBDates } from './queries'
import type { CNBDailyFixing } from './types'

export function useRecentRates(businessDays: number = 30) {
  const calendarDays = calendarDaysFor(businessDays)
  const dates = useMemo(() => recentCNBDates(calendarDays), [calendarDays])

  const combine = useCallback(
    (results: UseQueryResult<CNBDailyFixing>[]) => {
      const byDate = new Map<string, CNBDailyFixing>()
      for (const result of results) {
        if (result.data) byDate.set(result.data.date, result.data)
      }
      const data = Array.from(byDate.values())
        .sort((left, right) => left.date.localeCompare(right.date))
        .slice(-businessDays)
      const firstError = results.find(result => result.isError)?.error
      return {
        data,
        error: firstError,
        isError: Boolean(firstError) && data.length === 0,
        isFetching: results.some(result => result.isFetching),
        isLoading:
          data.length === 0 && results.some(result => result.isLoading),
        isPending:
          data.length === 0 && results.some(result => result.isPending),
        isPlaceholderData: false,
      }
    },
    [businessDays],
  )

  return useQueries({
    queries: dates.map(dailyAtQueryOptions),
    combine,
  })
}
