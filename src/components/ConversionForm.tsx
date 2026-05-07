import { Ionicons } from '@expo/vector-icons'
import { useMemo, useState } from 'react'
import styled from 'styled-components/native'

import { useDailyRates } from '../api/cnb/useDailyRates'
import { useSelectedRate } from '../hooks/useSelectedRate'
import { convertCurrency, CZK_RATE } from '../lib/convert'
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

  const amount = useConversionStore(s => s.amount)
  const setAmount = useConversionStore(s => s.setAmount)
  const sourceCode = useConversionStore(s => s.sourceCode)
  const targetCode = useConversionStore(s => s.targetCode)
  const setSourceCode = useConversionStore(s => s.setSourceCode)
  const setTargetCode = useConversionStore(s => s.setTargetCode)
  const swap = useConversionStore(s => s.swap)
  const sourceAmount = useEvaluatedAmount()

  const [pickerSide, setPickerSide] = useState<PickerSide>(null)
  const [keypadOpen, setKeypadOpen] = useState(false)

  const ratesWithCzk = useMemo(
    () => (data ? [CZK_RATE, ...data.rates] : []),
    [data],
  )
  const sourceRate = useSelectedRate(ratesWithCzk, sourceCode, 'CZK')
  const targetRate = useSelectedRate(ratesWithCzk, targetCode, 'USD')

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
          rates={ratesWithCzk}
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
  shadow-offset: 0px 2px;
  shadow-opacity: 0.12;
  shadow-radius: 4px;
  elevation: 3;
`
