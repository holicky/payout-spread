import { useQuery } from '@tanstack/react-query'

import { aggregateRecentRatesQueryOptions } from './queries'

export function useAggregateRecentRates(businessDays: number) {
  return useQuery(aggregateRecentRatesQueryOptions(businessDays))
}
