import { useMemo } from 'react'
import styled from 'styled-components/native'

import { useRecentRates } from '../api/cnb/useRecentRates'
import { bestPartOfMonth, bestWeekday } from '../lib/insights'
import { useConversionStore } from '../state/conversion'
import { colors, spacing } from '../theme'
import { Disclaimer } from './Disclaimer'
import { InsightCard } from './InsightCard'

const INSIGHTS_WINDOW_DAYS = 90
const INSIGHTS_MIN_SAMPLES = 60

export function ConversionInsights() {
  const { data, isLoading } = useRecentRates(INSIGHTS_WINDOW_DAYS)
  const sourceCode = useConversionStore(state => state.sourceCode)
  const targetCode = useConversionStore(state => state.targetCode)

  const samples = data?.length ?? 0
  const hasEnoughData = samples >= INSIGHTS_MIN_SAMPLES

  const { weekdayInsight, monthPartInsight } = useMemo(
    () =>
      hasEnoughData && data
        ? {
            weekdayInsight: bestWeekday(data, sourceCode, targetCode),
            monthPartInsight: bestPartOfMonth(data, sourceCode, targetCode),
          }
        : { weekdayInsight: null, monthPartInsight: null },
    [data, hasEnoughData, sourceCode, targetCode],
  )

  if (!hasEnoughData) {
    return (
      <>
        <SectionTitle>Insights</SectionTitle>
        <InsightCard
          icon="time-outline"
          headline="Gathering history"
          detail={
            isLoading
              ? 'Loading rate history…'
              : `Need ${INSIGHTS_MIN_SAMPLES} business days, have ${samples}.`
          }
        />
      </>
    )
  }

  if (!weekdayInsight && !monthPartInsight) return null
  const sampleSize = samples

  return (
    <>
      {weekdayInsight ? (
        <>
          <SectionTitle>Best day of week</SectionTitle>
          <InsightCard
            icon="calendar-outline"
            headline={weekdayInsight.weekdayName}
            detail={`${signed(weekdayInsight.advantagePercent)}% vs average · ${weekdayInsight.sampleSize} samples`}
            confidence={weekdayInsight.confidence}
          />
        </>
      ) : null}

      {monthPartInsight ? (
        <>
          <SectionTitle>Best part of month</SectionTitle>
          <InsightCard
            icon="calendar-number-outline"
            headline={monthPartInsight.partLabel}
            detail={`${signed(monthPartInsight.advantagePercent)}% vs average · ${monthPartInsight.sampleSize} samples`}
            confidence={monthPartInsight.confidence}
          />
        </>
      ) : null}

      <Gap />
      <Disclaimer>
        Insights are derived from a limited historical window ({sampleSize}{' '}
        business days) and are not financial advice. Past patterns do not
        predict future rates.
      </Disclaimer>
    </>
  )
}

function signed(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`
}

const SectionTitle = styled.Text`
  margin-top: ${spacing.xl}px;
  margin-bottom: ${spacing.sm}px;
  font-size: 13px;
  font-weight: 600;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const Gap = styled.View`
  height: ${spacing.md}px;
`
