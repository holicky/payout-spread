import { Ionicons } from '@expo/vector-icons'
import styled from 'styled-components/native'

import { colors, radii, spacing } from '../../theme'
import { CurrencyFlag } from './CurrencyFlag'
import { HapticPressable } from '../HapticPressable'

type Props = {
  code: string
  amount?: string
  rateLine?: string
  onCurrencyPress: () => void
  onAmountPress?: () => void
  compact?: boolean
  testID?: string
  currencyTestID?: string
  amountTestID?: string
}

export function CurrencyCard({
  code,
  amount = '',
  rateLine,
  onCurrencyPress,
  onAmountPress,
  compact,
  testID,
  currencyTestID,
  amountTestID,
}: Props) {
  if (compact) {
    return (
      <CompactCard
        testID={testID}
        onPress={onCurrencyPress}
        accessibilityLabel={`Selected currency: ${code}. Tap to change.`}
      >
        <CompactLeft>
          <CurrencyFlag code={code} size={24} />
          <Code>{code}</Code>
        </CompactLeft>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </CompactCard>
    )
  }

  return (
    <Card testID={testID}>
      <CurrencyButton
        testID={currencyTestID}
        onPress={onCurrencyPress}
        accessibilityLabel={`Selected currency: ${code}. Tap to change.`}
      >
        <CurrencyFlag code={code} size={28} />
        <Code>{code}</Code>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </CurrencyButton>

      {onAmountPress ? (
        <AmountButton
          testID={amountTestID}
          onPress={onAmountPress}
          accessibilityLabel={`Amount ${amount || '0'}. Tap to edit.`}
        >
          <AmountText>{amount || '0'}</AmountText>
          {rateLine ? <RateLine>{rateLine}</RateLine> : null}
        </AmountButton>
      ) : (
        <Right testID={amountTestID}>
          <AmountText>{amount || '0'}</AmountText>
          {rateLine ? <RateLine>{rateLine}</RateLine> : null}
        </Right>
      )}
    </Card>
  )
}

const CurrencyButton = styled(HapticPressable)`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

const AmountButton = styled(HapticPressable)`
  flex: 1;
  margin-left: ${spacing.md}px;
  padding-vertical: 6px;
  align-items: flex-end;
`

const Card = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${colors.surface};
  border-radius: ${radii.md}px;
  padding: 14px ${spacing.lg}px;
  border-width: 1px;
  border-color: ${colors.border};
`

const CompactCard = styled(HapticPressable)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${colors.surface};
  border-radius: ${radii.md}px;
  padding: 16px ${spacing.lg}px;
  border-width: 1px;
  border-color: ${colors.border};
`

const CompactLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

const Right = styled.View`
  flex: 1;
  margin-left: ${spacing.md}px;
  align-items: flex-end;
`

const Code = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.text};
`

const AmountText = styled.Text`
  text-align: right;
  font-size: 22px;
  font-weight: 600;
  color: ${colors.text};
  font-variant: tabular-nums;
`

const RateLine = styled.Text`
  margin-top: 4px;
  color: ${colors.textMuted};
  font-size: 13px;
  font-variant: tabular-nums;
`
