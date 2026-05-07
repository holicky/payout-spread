import { useMemo } from 'react'
import styled from 'styled-components/native'

import { useAggregateRecentRates } from '../api/cnb/useAggregateRecentRates'
import { bestPartOfMonth, bestWeekday } from '../lib/insights'
import { useConversionStore } from '../state/conversion'
import { colors, spacing } from '../theme'
import { Disclaimer } from './Disclaimer'
import { InsightCard } from './InsightCard'

const INSIGHTS_WINDOW_DAYS = 90

export function ConversionInsights() {
  const { data } = useAggregateRecentRates(INSIGHTS_WINDOW_DAYS)
  const sourceCode = useConversionStore(s => s.sourceCode)
  const targetCode = useConversionStore(s => s.targetCode)

  const { weekdayInsight, monthPartInsight } = useMemo(
    () =>
      data && data.length >= INSIGHTS_WINDOW_DAYS
        ? {
            weekdayInsight: bestWeekday(data, sourceCode, targetCode),
            monthPartInsight: bestPartOfMonth(data, sourceCode, targetCode),
          }
        : { weekdayInsight: null, monthPartInsight: null },
    [data, sourceCode, targetCode],
  )

  if (!weekdayInsight && !monthPartInsight) return null
  const sampleSize = data?.length ?? INSIGHTS_WINDOW_DAYS

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

function signed(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}`
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
