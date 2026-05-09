import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import styled from 'styled-components/native'

import { useDailyRates } from '../api/cnb/useDailyRates'
import { useRatesWithCZK } from '../hooks/useRatesWithCZK'
import { convertCurrency } from '../lib/convert'
import { selectRate } from '../lib/select-rate'
import { formatNumber } from '../lib/format'
import { TEST_IDS } from '../lib/testIds'
import { useConversionStore, useEvaluatedAmount } from '../state/conversion'
import { colors, radii, spacing, topEdgeShadow } from '../theme'
import { CalculatorKeypad } from './calculator/CalculatorKeypad'
import { CurrencyCard } from './currency/CurrencyCard'
import { CurrencyPickerModal } from './currency/CurrencyPickerModal'
import { HapticPressable } from './HapticPressable'

type PickerSide = 'source' | 'target' | null

export function ConversionForm() {
  const { data } = useDailyRates()

  const amount = useConversionStore(state => state.amount)
  const setAmount = useConversionStore(state => state.setAmount)
  const sourceCode = useConversionStore(state => state.sourceCode)
  const targetCode = useConversionStore(state => state.targetCode)
  const setSourceCode = useConversionStore(state => state.setSourceCode)
  const setTargetCode = useConversionStore(state => state.setTargetCode)
  const swap = useConversionStore(state => state.swap)
  const sourceAmount = useEvaluatedAmount()

  const [pickerSide, setPickerSide] = useState<PickerSide>(null)
  const [keypadOpen, setKeypadOpen] = useState(false)

  const ratesWithCZK = useRatesWithCZK(data)
  const sourceRate = selectRate(ratesWithCZK, sourceCode, 'CZK')
  const targetRate = selectRate(ratesWithCZK, targetCode, 'USD')

  if (!sourceRate || !targetRate) return null

  const targetAmount =
    sourceAmount == null
      ? null
      : convertCurrency(sourceAmount, sourceRate, targetRate)
  const perOne = convertCurrency(1, sourceRate, targetRate)
  const rateLine = `1 ${sourceCode} = ${perOne.toFixed(4)} ${targetCode}`

  const sourceDisplay =
    keypadOpen || sourceAmount == null ? amount : formatNumber(sourceAmount)

  return (
    <>
      <CurrencyCard
        currencyTestID={TEST_IDS.converter.sourceCurrency}
        amountTestID={TEST_IDS.converter.sourceAmount}
        code={sourceCode}
        amount={sourceDisplay}
        onCurrencyPress={() => setPickerSide('source')}
        onAmountPress={() => setKeypadOpen(true)}
      />

      <SwapRow>
        <SwapButton
          testID={TEST_IDS.converter.swap}
          onPress={swap}
          accessibilityLabel="Swap currencies"
          haptic="light"
        >
          <Ionicons name="swap-vertical" size={20} color={colors.surface} />
        </SwapButton>
      </SwapRow>

      <CurrencyCard
        currencyTestID={TEST_IDS.converter.targetCurrency}
        amountTestID={TEST_IDS.converter.targetAmount}
        code={targetCode}
        amount={targetAmount == null ? '—' : formatNumber(targetAmount)}
        rateLine={rateLine}
        onCurrencyPress={() => setPickerSide('target')}
      />

      {pickerSide ? (
        <CurrencyPickerModal
          open
          rates={ratesWithCZK}
          selected={pickerSide === 'target' ? targetCode : sourceCode}
          onClose={() => setPickerSide(null)}
          onPick={code => {
            if (pickerSide === 'source') setSourceCode(code)
            else setTargetCode(code)
            setPickerSide(null)
          }}
        />
      ) : null}

      <CalculatorKeypad
        open={keypadOpen}
        initialValue={amount}
        onChange={setAmount}
        onClose={() => setKeypadOpen(false)}
      />

      <Attribution>Source: Czech National Bank</Attribution>
    </>
  )
}

const Attribution = styled.Text`
  margin-top: ${spacing.sm}px;
  color: ${colors.textSubtle};
  font-size: 12px;
  text-align: center;
`

const SwapRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: ${spacing.sm}px 0;
`

const SwapButton = styled(HapticPressable)`
  width: 40px;
  height: 40px;
  border-radius: ${radii.pill}px;
  background-color: ${colors.accent};
  align-items: center;
  justify-content: center;
  shadow-color: ${topEdgeShadow.shadowColor};
  shadow-offset: 0px 1px;
  shadow-opacity: 0.06;
  shadow-radius: 2px;
  elevation: 1;
`
