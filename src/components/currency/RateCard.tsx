import { memo } from 'react'
import styled from 'styled-components/native'

import type { CurrencyRate } from '../../api/cnb/types'
import { convertCurrency } from '../../lib/convert'
import { nameFor } from '../../lib/currency-names'
import { formatNumber } from '../../lib/format'
import { TEST_IDS } from '../../lib/testIds'
import { colors, radii, spacing } from '../../theme'
import { CurrencyFlag } from './CurrencyFlag'

type Props = {
  rate: CurrencyRate
  reference: CurrencyRate
}

export const RateCard = memo(function RateCard({ rate, reference }: Props) {
  const perOne = convertCurrency(1, rate, reference)
  const displayName = nameFor(rate.code, rate.currencyName)
  return (
    <Card
      testID={TEST_IDS.rates.card(rate.code)}
      accessible
      accessibilityLabel={`${rate.code}, ${displayName}. ${formatNumber(
        perOne,
        4,
      )} ${reference.code} per 1 ${rate.code}.`}
    >
      <Left>
        <CurrencyFlag code={rate.code} size={32} />
        <LeftText>
          <Code>{rate.code}</Code>
          <CountryName numberOfLines={1}>{displayName}</CountryName>
        </LeftText>
      </Left>
      <Right>
        <Rate>
          {formatNumber(perOne, 4)} {reference.code}
        </Rate>
        <Subtle>
          per 1 {rate.code}
          {rate.amount !== 1 ? ` · quoted per ${rate.amount}` : ''}
        </Subtle>
      </Right>
    </Card>
  )
})

const Card = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${colors.surface};
  border-radius: ${radii.md}px;
  padding: ${spacing.md}px 14px;
`

const Left = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing.md}px;
  flex: 1;
`

const LeftText = styled.View`
  flex: 1;
`

const Right = styled.View`
  align-items: flex-end;
`

const Code = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${colors.text};
`

const CountryName = styled.Text`
  color: ${colors.textMuted};
  font-size: 12px;
  margin-top: 2px;
`

const Rate = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.text};
  font-variant: tabular-nums;
`

const Subtle = styled.Text`
  color: ${colors.textSubtle};
  font-size: 12px;
  margin-top: 2px;
`
