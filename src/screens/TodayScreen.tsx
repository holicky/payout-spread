import { useState } from 'react'
import { FlatList, RefreshControl } from 'react-native'
import styled from 'styled-components/native'

import type { CNBDailyFixing } from '../api/cnb/types'
import { CurrencyCard } from '../components/currency/CurrencyCard'
import { LastUpdated } from '../components/LastUpdated'
import { RateCard } from '../components/currency/RateCard'
import { RatesScreenShell } from '../components/RatesScreenShell'
import { useRatesWithCZK } from '../hooks/useRatesWithCZK'
import { selectRate } from '../lib/select-rate'
import { TEST_IDS } from '../lib/testIds'
import { useConversionStore } from '../state/conversion'
import { colors, spacing } from '../theme'
import { CurrencyPickerModal } from '../components/currency/CurrencyPickerModal'

export function TodayScreen() {
  const sourceCode = useConversionStore(state => state.sourceCode)
  const setSourceCode = useConversionStore(state => state.setSourceCode)
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <RatesScreenShell testID={TEST_IDS.screen.today}>
      {({ data, dataUpdatedAt, refetch, isFetching, isRefetching }) => (
        <TodayContent
          data={data}
          dataUpdatedAt={dataUpdatedAt}
          isFetching={isFetching}
          isRefetching={isRefetching}
          refetch={refetch}
          sourceCode={sourceCode}
          setSourceCode={setSourceCode}
          pickerOpen={pickerOpen}
          setPickerOpen={setPickerOpen}
        />
      )}
    </RatesScreenShell>
  )
}

function TodayContent({
  data,
  dataUpdatedAt,
  isFetching,
  isRefetching,
  refetch,
  sourceCode,
  setSourceCode,
  pickerOpen,
  setPickerOpen,
}: {
  data: CNBDailyFixing
  dataUpdatedAt: number
  isFetching: boolean
  isRefetching: boolean
  refetch: () => void
  sourceCode: string
  setSourceCode: (code: string) => void
  pickerOpen: boolean
  setPickerOpen: (open: boolean) => void
}) {
  const ratesWithCZK = useRatesWithCZK(data)
  const reference = selectRate(ratesWithCZK, sourceCode, 'CZK')

  if (!reference) return null

  return (
    <>
      <FlatList
        testID={TEST_IDS.rates.list}
        data={data.rates.filter(rate => rate.code !== reference.code)}
        keyExtractor={rate => rate.code}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <RateCard rate={item} reference={reference} />
        )}
        ItemSeparatorComponent={Gap}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListHeaderComponent={
          <Header>
            <LastUpdated
              date={data.date}
              updatedAt={dataUpdatedAt}
              onRefresh={() => {
                refetch()
              }}
              isRefreshing={isFetching}
              testID={TEST_IDS.common.refreshRates}
            />
            <SmallSpacer />
            <FieldLabel>Show rates in</FieldLabel>
            <CurrencyCard
              compact
              code={reference.code}
              testID={TEST_IDS.rates.referenceCurrency}
              onCurrencyPress={() => setPickerOpen(true)}
            />
            <BigSpacer />
          </Header>
        }
      />

      {pickerOpen ? (
        <CurrencyPickerModal
          open
          rates={ratesWithCZK}
          selected={reference.code}
          onClose={() => setPickerOpen(false)}
          onPick={code => {
            setSourceCode(code)
            setPickerOpen(false)
          }}
        />
      ) : null}
    </>
  )
}

const Header = styled.View``

const SmallSpacer = styled.View`
  height: ${spacing.sm}px;
`

const BigSpacer = styled.View`
  height: ${spacing.md}px;
`

const FieldLabel = styled.Text`
  color: ${colors.textMuted};
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  margin-bottom: 6px;
`

const Gap = styled.View`
  height: 8px;
`
