import { NavigationContainer } from '@react-navigation/native'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { usePrefetchTodaysRate } from './api/cnb/usePrefetchTodaysRate'
import { persistOptions, queryClient } from './api/queryClient'
import { RootTabs } from './navigation/RootTabs'
import { navTheme } from './navigation/theme'

export default function App() {
  usePrefetchTodaysRate()

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
    >
      <SafeAreaProvider>
        <NavigationContainer theme={navTheme}>
          <RootTabs />
          <StatusBar style="light" />
        </NavigationContainer>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  )
}
