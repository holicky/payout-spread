import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components/native'

import type { CNBDailyFixing, CurrencyRate } from '../api/cnb/types'
import { CurrencyCard } from '../components/currency/CurrencyCard'
import { LastUpdated } from '../components/LastUpdated'
import { PullList, pullRefreshControl } from '../components/PullToRefresh'
import { RateCard } from '../components/currency/RateCard'
import { RatesScreenShell } from '../components/RatesScreenShell'
import { StaggerFadeIn } from '../components/StaggerFadeIn'
import { useHeaderHeight } from '../components/Screen'
import { useRatesWithCZK } from '../hooks/useRatesWithCZK'
import { selectRate } from '../lib/select-rate'
import { TEST_IDS } from '../lib/testIds'
import { useConversionStore } from '../state/conversion'
import { colors, screenContent, spacing } from '../theme'
import { CurrencyPickerModal } from '../components/currency/CurrencyPickerModal'

export function TodayScreen() {
  const sourceCode = useConversionStore(state => state.sourceCode)
  const setSourceCode = useConversionStore(state => state.setSourceCode)
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <RatesScreenShell testID={TEST_IDS.screen.today} title="Today's Rates">
      {({ data, dataUpdatedAt, refetch, isRefetching }) => (
        <TodayContent
          data={data}
          dataUpdatedAt={dataUpdatedAt}
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
  isRefetching,
  refetch,
  sourceCode,
  setSourceCode,
  pickerOpen,
  setPickerOpen,
}: {
  data: CNBDailyFixing
  dataUpdatedAt: number
  isRefetching: boolean
  refetch: () => void
  sourceCode: string
  setSourceCode: (code: string) => void
  pickerOpen: boolean
  setPickerOpen: (open: boolean) => void
}) {
  const ratesWithCZK = useRatesWithCZK(data)
  const reference = selectRate(ratesWithCZK, sourceCode, 'CZK')
  const headerHeight = useHeaderHeight()

  const rates = useMemo(
    () =>
      reference ? data.rates.filter(rate => rate.code !== reference.code) : [],
    [data.rates, reference],
  )

  const renderRate = useCallback(
    ({ item, index }: { item: CurrencyRate; index: number }) =>
      reference ? (
        <StaggerFadeIn index={index}>
          <RateCard rate={item} reference={reference} />
        </StaggerFadeIn>
      ) : null,
    [reference],
  )

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  const refreshControl = useMemo(
    () =>
      pullRefreshControl({
        headerHeight,
        refreshing: isRefetching,
        onRefresh: handleRefresh,
      }),
    [headerHeight, isRefetching, handleRefresh],
  )

  const header = useMemo(() => {
    if (!reference) return null
    return (
      <Header>
        <LastUpdated date={data.date} updatedAt={dataUpdatedAt} />
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
    )
  }, [data.date, dataUpdatedAt, reference, setPickerOpen])

  if (!reference) return null

  return (
    <>
      <PullList<CurrencyRate>
        testID={TEST_IDS.rates.list}
        data={rates}
        keyExtractor={rate => rate.code}
        headerHeight={headerHeight}
        baseContentStyle={{
          ...screenContent,
          padding: spacing.lg,
          paddingBottom: 32,
        }}
        renderItem={renderRate}
        ItemSeparatorComponent={Gap}
        initialNumToRender={15}
        refreshControl={refreshControl}
        ListHeaderComponent={header}
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
