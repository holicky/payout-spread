import { useEffect } from 'react'

import { queryClient } from '../queryClient'
import { dailyAtQueryOptions } from './queries'

export function usePrefetchTodaysRate() {
  useEffect(() => {
    queryClient.prefetchQuery(dailyAtQueryOptions(new Date()))
  }, [])
}
