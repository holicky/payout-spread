import { memo, type ReactNode } from 'react'
import styled from 'styled-components/native'

import { TEST_IDS } from '../../lib/testIds'
import { colors, radii } from '../../theme'
import { HapticPressable } from '../HapticPressable'

type CalculatorKeyVariant = 'number' | 'operator' | 'done'

type Props = {
  variant: CalculatorKeyVariant
  onPress: () => void
  label?: string
  icon?: ReactNode
  flex?: number
  accessibilityLabel?: string
}

export const CalculatorKey = memo(function CalculatorKey({
  variant,
  onPress,
  label,
  icon,
  flex,
  accessibilityLabel,
}: Props) {
  const Button = BUTTON_BY_VARIANT[variant]
  const Label = LABEL_BY_VARIANT[variant]
  return (
    <Button
      onPress={onPress}
      testID={TEST_IDS.keypad.key(accessibilityLabel ?? label ?? 'icon')}
      accessibilityLabel={accessibilityLabel ?? label}
      style={flex !== undefined ? { flex } : undefined}
    >
      {icon ?? <Label>{label}</Label>}
    </Button>
  )
})

const NumberButton = styled(HapticPressable)`
  flex: 1;
  height: 60px;
  border-radius: ${radii.lg}px;
  background-color: ${colors.surface};
  border-width: 1px;
  border-color: ${colors.border};
  align-items: center;
  justify-content: center;
`

const OperatorButton = styled(HapticPressable)`
  flex: 1;
  height: 60px;
  border-radius: ${radii.lg}px;
  background-color: ${colors.navy};
  align-items: center;
  justify-content: center;
`

const DoneButton = styled(HapticPressable)`
  flex: 1;
  height: 60px;
  border-radius: ${radii.lg}px;
  background-color: ${colors.accent};
  align-items: center;
  justify-content: center;
`

const NumberLabel = styled.Text`
  font-size: 26px;
  color: ${colors.text};
`

const OperatorLabel = styled.Text`
  font-size: 24px;
  color: ${colors.surface};
`

const DoneLabel = styled.Text`
  font-size: 18px;
  color: ${colors.surface};
  font-weight: 600;
`

const BUTTON_BY_VARIANT = {
  number: NumberButton,
  operator: OperatorButton,
  done: DoneButton,
}

const LABEL_BY_VARIANT = {
  number: NumberLabel,
  operator: OperatorLabel,
  done: DoneLabel,
}
