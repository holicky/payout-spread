import { useCallback, useEffect, useMemo, useRef } from 'react'

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
  // Held in a ref because the keypad UI never reads calculator state — only
  // dispatches actions. Storing in useState forced onChange into a setState
  // updater, which React flags as updating a parent during a child's render.
  const stateRef = useRef<CalculatorState>(INITIAL_STATE)

  const initialValueRef = useRef(initialValue)
  initialValueRef.current = initialValue

  useEffect(() => {
    if (!open) return
    stateRef.current = calculatorReducer(INITIAL_STATE, {
      type: 'seed',
      value: initialValueRef.current,
    })
  }, [open])

  const dispatch = useCallback(
    (action: CalculatorAction) => {
      const next = calculatorReducer(stateRef.current, action)
      stateRef.current = next
      onChange(action.type === 'equals' ? next.display : expressionFor(next))
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
