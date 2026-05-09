import { useCallback, useMemo } from 'react'
import { useQueries, type UseQueryResult } from '@tanstack/react-query'

import { calendarDaysFor } from './client'
import { recentCNBDates, yearlyQueryOptions } from './queries'
import type { CNBDailyFixing } from './types'

export function useRecentRates(businessDays: number = 30) {
  const calendarDays = calendarDaysFor(businessDays)
  const dates = useMemo(() => recentCNBDates(calendarDays), [calendarDays])
  const years = useMemo(
    () =>
      Array.from(new Set(dates.map(date => date.getFullYear()))).sort(
        (left, right) => left - right,
      ),
    [dates],
  )

  const combine = useCallback(
    (results: UseQueryResult<CNBDailyFixing[]>[]) => {
      const byDate = new Map<string, CNBDailyFixing>()
      for (const result of results) {
        for (const fixing of result.data ?? []) {
          byDate.set(fixing.date, fixing)
        }
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
    queries: years.map(yearlyQueryOptions),
    combine,
  })
}
