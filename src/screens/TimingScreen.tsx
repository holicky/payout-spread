import { ScrollView } from 'react-native'
import styled from 'styled-components/native'

import { ConversionForm } from '../components/ConversionForm'
import { ConversionInsights } from '../components/ConversionInsights'
import { LastUpdated } from '../components/LastUpdated'
import { RatesScreenShell } from '../components/RatesScreenShell'
import { useHeaderHeight } from '../components/Screen'
import { TEST_IDS } from '../lib/testIds'
import { screenContent, spacing } from '../theme'

export function TimingScreen() {
  return (
    <RatesScreenShell testID={TEST_IDS.screen.timing} title="Conversion Timing">
      {({ data, dataUpdatedAt, refetch, isFetching }) => (
        <TimingContent
          date={data.date}
          dataUpdatedAt={dataUpdatedAt}
          refetch={refetch}
          isFetching={isFetching}
        />
      )}
    </RatesScreenShell>
  )
}

function TimingContent({
  date,
  dataUpdatedAt,
  refetch,
  isFetching,
}: {
  date: string
  dataUpdatedAt: number
  refetch: () => void
  isFetching: boolean
}) {
  const headerHeight = useHeaderHeight()
  return (
    <Scroll
      contentContainerStyle={{
        ...screenContent,
        padding: spacing.lg,
        paddingBottom: 32,
        marginTop: headerHeight,
      }}
    >
      <LastUpdated
        date={date}
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
  )
}

const Scroll = styled(ScrollView)`
  flex: 1;
`
