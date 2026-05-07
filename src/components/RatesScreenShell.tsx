import type { ReactNode } from 'react'
import { ActivityIndicator } from 'react-native'

import { useDailyRates } from '../api/cnb/useDailyRates'
import type { CnbDailyFixing } from '../api/cnb/types'
import { Centered } from './Centered'
import { ErrorState } from './ErrorState'
import { Screen } from './Screen'

type RatesScreenState = {
  data: CnbDailyFixing
  dataUpdatedAt: number
  isFetching: boolean
  isRefetching: boolean
  refetch: () => void
}

type Props = {
  testID: string
  children: (state: RatesScreenState) => ReactNode
}

export function RatesScreenShell({ testID, children }: Props) {
  const {
    data,
    isPending,
    isError,
    error,
    dataUpdatedAt,
    refetch,
    isFetching,
    isRefetching,
  } = useDailyRates()

  return (
    <Screen testID={testID}>
      {isPending ? (
        <Centered>
          <ActivityIndicator />
        </Centered>
      ) : isError || !data ? (
        <Centered>
          <ErrorState
            error={error}
            onRetry={() => {
              refetch()
            }}
            isRetrying={isFetching}
          />
        </Centered>
      ) : (
        children({
          data,
          dataUpdatedAt,
          isFetching,
          isRefetching,
          refetch,
        })
      )}
    </Screen>
  )
}
