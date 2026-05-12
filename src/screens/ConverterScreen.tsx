import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { ScrollView } from 'react-native'
import styled from 'styled-components/native'

import { ConversionForm } from '../components/ConversionForm'
import { ConversionHistory } from '../components/ConversionHistory'
import { CtaButton } from '../components/CtaButton'
import { LastUpdated } from '../components/LastUpdated'
import { RatesScreenShell } from '../components/RatesScreenShell'
import { useHeaderHeight } from '../components/Screen'
import { StaggerFadeIn } from '../components/StaggerFadeIn'
import { TEST_IDS } from '../lib/testIds'
import type { RootTabParamList } from '../navigation/RootTabs'
import { screenContent, spacing } from '../theme'

export function ConverterScreen() {
  return (
    <RatesScreenShell testID={TEST_IDS.screen.converter} title="Converter">
      {({ data, dataUpdatedAt, refetch, isFetching }) => (
        <ConverterContent
          date={data.date}
          dataUpdatedAt={dataUpdatedAt}
          refetch={refetch}
          isFetching={isFetching}
        />
      )}
    </RatesScreenShell>
  )
}

function ConverterContent({
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
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>()
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
    </Scroll>
  )
}

const Scroll = styled(ScrollView)`
  flex: 1;
`

const CtaWrap = styled.View`
  margin-top: ${spacing.xl}px;
`
