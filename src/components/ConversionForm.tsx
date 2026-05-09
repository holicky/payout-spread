import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import styled from 'styled-components/native'

import { useDailyRates } from '../api/cnb/useDailyRates'
import { useRatesWithCZK } from '../hooks/useRatesWithCZK'
import { convertCurrency } from '../lib/convert'
import { selectRate } from '../lib/select-rate'
import { formatNumber } from '../lib/format'
import { TEST_IDS } from '../lib/testIds'
import {
  type EditingSide,
  useConversionStore,
  useEvaluatedAmount,
} from '../state/conversion'
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
  const editingSide = useConversionStore(state => state.editingSide)
  const setEditingSide = useConversionStore(state => state.setEditingSide)
  const swap = useConversionStore(state => state.swap)
  const typedAmount = useEvaluatedAmount()

  const [pickerSide, setPickerSide] = useState<PickerSide>(null)
  const [keypadOpen, setKeypadOpen] = useState(false)

  const ratesWithCZK = useRatesWithCZK(data)
  const sourceRate = selectRate(ratesWithCZK, sourceCode, 'CZK')
  const targetRate = selectRate(ratesWithCZK, targetCode, 'USD')

  if (!sourceRate || !targetRate) return null

  const editingSource = editingSide === 'source'
  const fromRate = editingSource ? sourceRate : targetRate
  const toRate = editingSource ? targetRate : sourceRate
  const derivedAmount =
    typedAmount == null ? null : convertCurrency(typedAmount, fromRate, toRate)

  const sourceAmount = editingSource ? typedAmount : derivedAmount
  const targetAmount = editingSource ? derivedAmount : typedAmount

  const perOne = convertCurrency(1, sourceRate, targetRate)
  const rateLine = `1 ${sourceCode} = ${perOne.toFixed(4)} ${targetCode}`

  const sourceDisplay =
    keypadOpen && editingSource ? amount : formatSide(sourceAmount)
  const targetDisplay =
    keypadOpen && !editingSource ? amount : formatSide(targetAmount)

  const editSide = (side: EditingSide) => {
    if (editingSide !== side) {
      setAmount(seedString(side === 'source' ? sourceAmount : targetAmount))
      setEditingSide(side)
    }
    setKeypadOpen(true)
  }

  return (
    <>
      <CurrencyCard
        currencyTestID={TEST_IDS.converter.sourceCurrency}
        amountTestID={TEST_IDS.converter.sourceAmount}
        code={sourceCode}
        amount={sourceDisplay}
        onCurrencyPress={() => setPickerSide('source')}
        onAmountPress={() => editSide('source')}
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
        amount={targetDisplay}
        rateLine={rateLine}
        onCurrencyPress={() => setPickerSide('target')}
        onAmountPress={() => editSide('target')}
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

const formatSide = (value: number | null): string =>
  value == null ? '—' : formatNumber(value)

const seedString = (value: number | null): string =>
  value != null && Number.isFinite(value)
    ? String(Math.round(value * 10000) / 10000)
    : ''

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
