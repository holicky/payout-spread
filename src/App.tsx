import AsyncStorage from '@react-native-async-storage/async-storage'
import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import {
  focusManager,
  QueryClient,
  useQueryClient,
} from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { AppState } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { dailyAtQueryOptions, shouldRetryCnbQuery } from './api/cnb/queries'
import { RootTabs } from './navigation/RootTabs'
import { colors } from './theme'

const ONE_DAY_MS = 24 * 60 * 60 * 1000

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryCnbQuery,
      gcTime: ONE_DAY_MS,
    },
  },
})

focusManager.setEventListener(handleFocus => {
  const subscription = AppState.addEventListener('change', state => {
    handleFocus(state === 'active')
  })

  return () => subscription.remove()
})

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'payout-spread:rq-cache:v1',
})

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.accentDeep,
  },
}

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: ONE_DAY_MS,
      }}
    >
      <Prefetcher />
      <SafeAreaProvider>
        <NavigationContainer theme={navTheme}>
          <RootTabs />
          <StatusBar style="light" />
        </NavigationContainer>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  )
}

function Prefetcher() {
  const queryClient = useQueryClient()
  useEffect(() => {
    queryClient.prefetchQuery(dailyAtQueryOptions(new Date()))
  }, [queryClient])
  return null
}
