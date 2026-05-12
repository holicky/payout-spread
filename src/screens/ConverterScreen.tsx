import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { useMemo } from 'react'
import styled from 'styled-components/native'

import { ConversionForm } from '../components/ConversionForm'
import { ConversionHistory } from '../components/ConversionHistory'
import { CtaButton } from '../components/CtaButton'
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
import type { RootTabParamList } from '../navigation/RootTabs'
import { screenContent, spacing } from '../theme'

export function ConverterScreen() {
  return (
    <RatesScreenShell testID={TEST_IDS.screen.converter} title="Converter">
      {({ data, dataUpdatedAt, refetch, isRefetching }) => (
        <ConverterContent
          date={data.date}
          dataUpdatedAt={dataUpdatedAt}
          refetch={refetch}
          isRefetching={isRefetching}
        />
      )}
    </RatesScreenShell>
  )
}

function ConverterContent({
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
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>()
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
      <StaggerFadeIn index={0}>
        <ConversionForm />
      </StaggerFadeIn>
      <StaggerFadeIn index={1}>
        <CtaWrap>
          <CtaButton
            testID={TEST_IDS.converter.timingCta}
            label="Check best day to convert"
            onPress={() => navigation.navigate('Timing')}
          />
        </CtaWrap>
      </StaggerFadeIn>
      <StaggerFadeIn index={2}>
        <ConversionHistory />
      </StaggerFadeIn>
    </PullScroll>
  )
}

const CtaWrap = styled.View`
  margin-top: ${spacing.xl}px;
`
