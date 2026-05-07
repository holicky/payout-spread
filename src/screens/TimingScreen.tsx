import { ScrollView } from 'react-native'
import styled from 'styled-components/native'

import { ConversionForm } from '../components/ConversionForm'
import { ConversionInsights } from '../components/ConversionInsights'
import { LastUpdated } from '../components/LastUpdated'
import { RatesScreenShell } from '../components/RatesScreenShell'
import { TEST_IDS } from '../lib/testIds'
import { spacing } from '../theme'

export function TimingScreen() {
  return (
    <RatesScreenShell testID={TEST_IDS.screen.timing}>
      {({ data, dataUpdatedAt, refetch, isFetching }) => (
        <Scroll
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 32 }}
        >
          <LastUpdated
            date={data.date}
            updatedAt={dataUpdatedAt}
            onRefresh={() => {
              refetch()
            }}
            isRefreshing={isFetching}
            testID={TEST_IDS.common.refreshRates}
          />
          <ConversionForm />
          <ConversionInsights />
        </Scroll>
      )}
    </RatesScreenShell>
  )
}

const Scroll = styled(ScrollView)`
  flex: 1;
`
