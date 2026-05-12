import { useMemo } from 'react'

import { ConversionForm } from '../components/ConversionForm'
import { ConversionInsights } from '../components/ConversionInsights'
import { LastUpdated } from '../components/LastUpdated'
import {
  PullScroll,
  pullRefreshControl,
  useFocusedKey,
} from '../components/PullToRefresh'
import { RatesScreenShell } from '../components/RatesScreenShell'
import { useHeaderHeight } from '../components/Screen'
import { StaggerFadeIn } from '../components/StaggerFadeIn'
import { TEST_IDS } from '../lib/testIds'
import { screenContent, spacing } from '../theme'

export function TimingScreen() {
  return (
    <RatesScreenShell testID={TEST_IDS.screen.timing} title="Conversion Timing">
      {({ data, dataUpdatedAt, refetch, isRefetching }) => (
        <TimingContent
          date={data.date}
          dataUpdatedAt={dataUpdatedAt}
          refetch={refetch}
          isRefetching={isRefetching}
        />
      )}
    </RatesScreenShell>
  )
}

function TimingContent({
  date,
  dataUpdatedAt,
  refetch,
  isRefetching,
}: {
  date: string
  dataUpdatedAt: number
  refetch: () => void
  isRefetching: boolean
}) {
  const headerHeight = useHeaderHeight()
  const refreshKey = useFocusedKey()
  const refreshControl = useMemo(
    () =>
      pullRefreshControl({
        refreshKey,
        headerHeight,
        refreshing: isRefetching,
        onRefresh: refetch,
      }),
    [refreshKey, headerHeight, isRefetching, refetch],
  )
  return (
    <PullScroll
      headerHeight={headerHeight}
      baseContentStyle={{
        ...screenContent,
        padding: spacing.lg,
        paddingBottom: 32,
      }}
      refreshControl={refreshControl}
    >
      <LastUpdated date={date} updatedAt={dataUpdatedAt} />
      <ConversionForm />
      <StaggerFadeIn index={0}>
        <ConversionInsights />
      </StaggerFadeIn>
    </PullScroll>
  )
}
