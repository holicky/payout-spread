import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { focusManager, QueryClient } from '@tanstack/react-query'
import { AppState } from 'react-native'

import { shouldRetryCnbQuery } from './cnb/queries'

const ONE_DAY_MS = 24 * 60 * 60 * 1000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryCnbQuery,
      gcTime: ONE_DAY_MS,
    },
  },
})

export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'payout-spread:rq-cache:v1',
})

export const persistOptions = {
  persister,
  maxAge: ONE_DAY_MS,
}

// Bridge React Query's focus tracking to React Native's AppState so background
// → foreground transitions trigger refetches the same way browser focus does.
focusManager.setEventListener(handleFocus => {
  const subscription = AppState.addEventListener('change', state => {
    handleFocus(state === 'active')
  })
  return () => subscription.remove()
})
