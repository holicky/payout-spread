import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  calculatorReducer,
  expressionFor,
  INITIAL_STATE,
  type CalculatorAction,
  type CalculatorState,
  type CalculatorOperator,
} from '../../lib/calculator'

export type CalculatorControls = {
  inputDigit: (digit: string) => void
  inputDot: () => void
  inputOperator: (operator: CalculatorOperator) => void
  clear: () => void
  backspace: () => void
  commit: () => void
}

export function useCalculator({
  open,
  initialValue,
  onChange,
}: {
  open: boolean
  initialValue: string
  onChange: (value: string) => void
}): CalculatorControls {
  const [, setState] = useState<CalculatorState>(INITIAL_STATE)

  const initialValueRef = useRef(initialValue)
  initialValueRef.current = initialValue

  useEffect(() => {
    if (!open) return
    setState(
      calculatorReducer(INITIAL_STATE, {
        type: 'seed',
        value: initialValueRef.current,
      }),
    )
  }, [open])

  const dispatch = useCallback(
    (action: CalculatorAction) => {
      setState(prev => {
        const next = calculatorReducer(prev, action)
        onChange(action.type === 'equals' ? next.display : expressionFor(next))
        return next
      })
    },
    [onChange],
  )

  return useMemo<CalculatorControls>(
    () => ({
      inputDigit: digit => dispatch({ type: 'digit', value: digit }),
      inputDot: () => dispatch({ type: 'dot' }),
      inputOperator: operator => dispatch({ type: 'operator', operator }),
      clear: () => dispatch({ type: 'clear' }),
      backspace: () => dispatch({ type: 'backspace' }),
      commit: () => dispatch({ type: 'equals' }),
    }),
    [dispatch],
  )
}
