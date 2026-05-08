import { Feather } from '@expo/vector-icons'
import { useCallback, useMemo } from 'react'
import { Modal, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import { colors, spacing, topEdgeShadow } from '../../theme'
import { TEST_IDS } from '../../lib/testIds'
import { CalculatorKey } from './CalculatorKey'
import { useCalculator } from './useCalculator'

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

export function CalculatorKeypad({
  open,
  initialValue,
  onChange,
  onClose,
}: {
  open: boolean
  initialValue: string
  onChange: (value: string) => void
  onClose: () => void
}) {
  const insets = useSafeAreaInsets()
  const calculator = useCalculator({ open, initialValue, onChange })

  const commitAndClose = useCallback(() => {
    calculator.commit()
    onClose()
  }, [calculator, onClose])

  const handlers = useMemo(() => {
    const digit = Object.fromEntries(
      DIGITS.map(d => [d, () => calculator.inputDigit(d)]),
    ) as Record<(typeof DIGITS)[number], () => void>
    return {
      digit,
      add: () => calculator.inputOperator('+'),
      subtract: () => calculator.inputOperator('-'),
      multiply: () => calculator.inputOperator('*'),
      divide: () => calculator.inputOperator('/'),
    }
  }, [calculator])

  return (
    <Modal
      testID={TEST_IDS.keypad.modal}
      transparent
      visible={open}
      animationType="slide"
      onRequestClose={commitAndClose}
    >
      <Layout>
        <Pressable
          testID={TEST_IDS.keypad.backdrop}
          style={{ flex: 1 }}
          onPress={commitAndClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss keypad"
        />
        <Keypad style={{ paddingBottom: spacing.md + insets.bottom }}>
          <Row>
            <CalculatorKey
              variant="number"
              label="7"
              onPress={handlers.digit['7']}
            />
            <CalculatorKey
              variant="number"
              label="8"
              onPress={handlers.digit['8']}
            />
            <CalculatorKey
              variant="number"
              label="9"
              onPress={handlers.digit['9']}
            />
            <CalculatorKey
              variant="operator"
              label="AC"
              onPress={calculator.clear}
            />
            <CalculatorKey
              variant="operator"
              accessibilityLabel="Backspace"
              icon={<Feather name="delete" size={22} color={colors.surface} />}
              onPress={calculator.backspace}
            />
          </Row>

          <Row>
            <CalculatorKey
              variant="number"
              label="4"
              onPress={handlers.digit['4']}
            />
            <CalculatorKey
              variant="number"
              label="5"
              onPress={handlers.digit['5']}
            />
            <CalculatorKey
              variant="number"
              label="6"
              onPress={handlers.digit['6']}
            />
            <CalculatorKey
              variant="operator"
              label="÷"
              accessibilityLabel="Divide"
              onPress={handlers.divide}
            />
            <CalculatorKey
              variant="operator"
              label="×"
              accessibilityLabel="Multiply"
              onPress={handlers.multiply}
            />
          </Row>

          <Row>
            <CalculatorKey
              variant="number"
              label="1"
              onPress={handlers.digit['1']}
            />
            <CalculatorKey
              variant="number"
              label="2"
              onPress={handlers.digit['2']}
            />
            <CalculatorKey
              variant="number"
              label="3"
              onPress={handlers.digit['3']}
            />
            <CalculatorKey
              variant="operator"
              label="−"
              accessibilityLabel="Subtract"
              onPress={handlers.subtract}
            />
            <CalculatorKey
              variant="operator"
              label="+"
              accessibilityLabel="Add"
              onPress={handlers.add}
            />
          </Row>

          <Row>
            <CalculatorKey
              variant="number"
              label="0"
              onPress={handlers.digit['0']}
            />
            <CalculatorKey
              variant="number"
              label="."
              onPress={calculator.inputDot}
            />
            <CalculatorKey
              variant="done"
              label="Done"
              flex={3}
              onPress={commitAndClose}
            />
          </Row>
        </Keypad>
      </Layout>
    </Modal>
  )
}

const Layout = styled.View`
  flex: 1;
`

const Keypad = styled.View`
  background-color: ${colors.surface};
  padding: ${spacing.sm}px ${spacing.sm}px 0;
  shadow-color: ${topEdgeShadow.shadowColor};
  shadow-offset: ${topEdgeShadow.shadowOffset.width}px
    ${topEdgeShadow.shadowOffset.height}px;
  shadow-opacity: ${topEdgeShadow.shadowOpacity};
  shadow-radius: ${topEdgeShadow.shadowRadius}px;
  elevation: ${topEdgeShadow.elevation};
`

const Row = styled.View`
  flex-direction: row;
  gap: ${spacing.sm}px;
  margin-bottom: ${spacing.sm}px;
`
