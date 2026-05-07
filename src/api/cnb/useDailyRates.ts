import { useQuery } from '@tanstack/react-query'

import { dailyAtQueryOptions } from './queries'

export function useDailyRates() {
  return useQuery(dailyAtQueryOptions(new Date()))
}
