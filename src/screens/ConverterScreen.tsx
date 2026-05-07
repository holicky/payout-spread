import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { ScrollView } from 'react-native'
import styled from 'styled-components/native'

import { ConversionForm } from '../components/ConversionForm'
import { ConversionHistory } from '../components/ConversionHistory'
import { CtaButton } from '../components/CtaButton'
import { LastUpdated } from '../components/LastUpdated'
import { RatesScreenShell } from '../components/RatesScreenShell'
import { TEST_IDS } from '../lib/testIds'
import type { RootTabParamList } from '../navigation/RootTabs'
import { spacing } from '../theme'

export function ConverterScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>()

  return (
    <RatesScreenShell testID={TEST_IDS.screen.converter}>
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
          <ConversionHistory />
          <CtaWrap>
            <CtaButton
              testID={TEST_IDS.converter.timingCta}
              label="Check best day to convert"
              onPress={() => navigation.navigate('Timing')}
            />
          </CtaWrap>
        </Scroll>
      )}
    </RatesScreenShell>
  )
}

const Scroll = styled(ScrollView)`
  flex: 1;
`

const CtaWrap = styled.View`
  margin-top: ${spacing.xl}px;
`
