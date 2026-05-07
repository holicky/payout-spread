import { Feather } from '@expo/vector-icons'
import { Modal, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import { colors, spacing, topEdgeShadow } from '../../theme'
import { TEST_IDS } from '../../lib/testIds'
import { CalculatorKey } from './CalculatorKey'
import { useCalculator } from './useCalculator'

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

  function commitAndClose() {
    calculator.commit()
    onClose()
  }

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
              onPress={() => calculator.inputDigit('7')}
            />
            <CalculatorKey
              variant="number"
              label="8"
              onPress={() => calculator.inputDigit('8')}
            />
            <CalculatorKey
              variant="number"
              label="9"
              onPress={() => calculator.inputDigit('9')}
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
              onPress={() => calculator.inputDigit('4')}
            />
            <CalculatorKey
              variant="number"
              label="5"
              onPress={() => calculator.inputDigit('5')}
            />
            <CalculatorKey
              variant="number"
              label="6"
              onPress={() => calculator.inputDigit('6')}
            />
            <CalculatorKey
              variant="operator"
              label="÷"
              accessibilityLabel="Divide"
              onPress={() => calculator.inputOperator('/')}
            />
            <CalculatorKey
              variant="operator"
              label="×"
              accessibilityLabel="Multiply"
              onPress={() => calculator.inputOperator('*')}
            />
          </Row>

          <Row>
            <CalculatorKey
              variant="number"
              label="1"
              onPress={() => calculator.inputDigit('1')}
            />
            <CalculatorKey
              variant="number"
              label="2"
              onPress={() => calculator.inputDigit('2')}
            />
            <CalculatorKey
              variant="number"
              label="3"
              onPress={() => calculator.inputDigit('3')}
            />
            <CalculatorKey
              variant="operator"
              label="−"
              accessibilityLabel="Subtract"
              onPress={() => calculator.inputOperator('-')}
            />
            <CalculatorKey
              variant="operator"
              label="+"
              accessibilityLabel="Add"
              onPress={() => calculator.inputOperator('+')}
            />
          </Row>

          <Row>
            <CalculatorKey
              variant="number"
              label="0"
              onPress={() => calculator.inputDigit('0')}
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
