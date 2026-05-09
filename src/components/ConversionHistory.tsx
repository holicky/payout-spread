import { useMemo, useState } from 'react'
import { useWindowDimensions, View } from 'react-native'
import styled from 'styled-components/native'

import type { CurrencyRate } from '../api/cnb/types'
import { useDailyRates } from '../api/cnb/useDailyRates'
import { useRecentRates } from '../api/cnb/useRecentRates'
import { useRatesWithCZK } from '../hooks/useRatesWithCZK'
import { convertCurrency } from '../lib/convert'
import { formatNumber } from '../lib/format'
import { selectRate } from '../lib/select-rate'
import { buildSeries } from '../lib/series'
import { TEST_IDS } from '../lib/testIds'
import {
  type EditingSide,
  useConversionStore,
  useEvaluatedAmount,
} from '../state/conversion'
import { colors, radii, spacing } from '../theme'
import { YieldChart } from './YieldChart'
import { PeriodSelector } from './PeriodSelector'
import { Skeleton } from './Skeleton'
import { StatsCard, type StatItem } from './StatsCard'

const DEFAULT_PERIOD_DAYS = 22

export function ConversionHistory() {
  const [days, setDays] = useState<number>(DEFAULT_PERIOD_DAYS)
  const { data, isLoading, isError, isPlaceholderData } = useRecentRates(days)
  const { data: latestFixing } = useDailyRates()
  const { width } = useWindowDimensions()
  const sourceCode = useConversionStore(state => state.sourceCode)
  const targetCode = useConversionStore(state => state.targetCode)
  const editingSide = useConversionStore(state => state.editingSide)
  const typedAmount = useEvaluatedAmount()

  const ratesWithCZK = useRatesWithCZK(latestFixing)
  const sourceRate = selectRate(ratesWithCZK, sourceCode, 'CZK')
  const targetRate = selectRate(ratesWithCZK, targetCode, 'USD')
  const sourceAmount = resolveSourceAmount({
    typed: typedAmount,
    side: editingSide,
    sourceRate,
    targetRate,
  })

  const series = useMemo(
    () =>
      data && data.length > 0
        ? buildSeries(data, sourceCode, targetCode, sourceAmount)
        : [],
    [data, sourceCode, sourceAmount, targetCode],
  )
  const stats = useMemo<StatItem[]>(() => {
    const values = series
      .map(point => point.value)
      .filter(value => Number.isFinite(value))
    const last = values.at(-1) ?? 0
    const first = values[0] ?? 0
    const min = values.length ? Math.min(...values) : 0
    const max = values.length ? Math.max(...values) : 0
    const delta = last - first
    const pct = first ? (delta / first) * 100 : 0

    return [
      { label: 'Latest', value: `${formatNumber(last)} ${targetCode}` },
      { label: 'Period low', value: `${formatNumber(min)} ${targetCode}` },
      { label: 'Period high', value: `${formatNumber(max)} ${targetCode}` },
      {
        label: 'Change vs. oldest',
        value: `${delta >= 0 ? '+' : ''}${formatNumber(delta)} ${targetCode} (${pct.toFixed(2)}%)`,
        tone: delta >= 0 ? 'positive' : 'negative',
      },
    ]
  }, [series, targetCode])

  if (isLoading || isError || !data || data.length === 0) {
    return (
      <>
        <Spacer />
        <ChartCardSkeleton />
        <Gap />
        <PeriodSelector selected={days} onChange={setDays} />
        <Gap />
        <StatsCardSkeleton />
      </>
    )
  }

  return (
    <Wrap testID={TEST_IDS.converter.history}>
      <Spacer />
      <YieldChart
        data={series}
        width={width}
        unit={targetCode}
        isLoading={isPlaceholderData}
      />
      <Gap />
      <PeriodSelector selected={days} onChange={setDays} />
      <Gap />
      {isPlaceholderData ? <StatsCardSkeleton /> : <StatsCard items={stats} />}
    </Wrap>
  )
}

const resolveSourceAmount = ({
  typed,
  side,
  sourceRate,
  targetRate,
}: {
  typed: number | null
  side: EditingSide
  sourceRate: CurrencyRate | undefined
  targetRate: CurrencyRate | undefined
}): number | null => {
  if (typed == null) return null
  if (side === 'source') return typed
  if (!sourceRate || !targetRate) return null
  return convertCurrency(typed, targetRate, sourceRate)
}

const Wrap = styled.View``

function ChartCardSkeleton() {
  return (
    <ChartCard>
      <Skeleton width={120} height={22} />
      <View style={{ height: 6 }} />
      <Skeleton width={90} height={12} />
      <View style={{ height: 24 }} />
      <Skeleton width="100%" height={140} borderRadius={radii.sm} />
    </ChartCard>
  )
}

function StatsCardSkeleton() {
  return (
    <StatsCardWrap>
      {[0, 1, 2, 3].map(i => (
        <Row key={i} $first={i === 0}>
          <Skeleton width={90} height={14} />
          <Skeleton width={110} height={14} />
        </Row>
      ))}
    </StatsCardWrap>
  )
}

const Spacer = styled.View`
  height: ${spacing.xl}px;
`

const Gap = styled.View`
  height: ${spacing.md}px;
`

const ChartCard = styled.View`
  background-color: ${colors.surface};
  border-radius: ${radii.md}px;
  padding: ${spacing.lg}px;
`

const StatsCardWrap = styled.View`
  background-color: ${colors.surface};
  border-radius: ${radii.md}px;
  padding: ${spacing.xs}px ${spacing.lg}px;
`

const Row = styled.View<{ $first?: boolean }>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.md}px 0;
  border-top-width: ${p => (p.$first ? 0 : 1)}px;
  border-top-color: ${colors.borderSoft};
`
