import { useEffect, useRef, useState } from 'react'

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
  const [state, setState] = useState<CalculatorState>(INITIAL_STATE)

  // Ref keeps the latest initialValue so seeding only fires on `open` transition,
  // not on every parent re-render that refreshes the prop.
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
    // No onChange — the seed mirrors what the parent already has.
  }, [open])

  function dispatch(action: CalculatorAction) {
    const next = calculatorReducer(state, action)
    setState(next)
    // After equals, emit the resolved numeric value; otherwise the live expression.
    onChange(action.type === 'equals' ? next.display : expressionFor(next))
  }

  return {
    inputDigit: digit => dispatch({ type: 'digit', value: digit }),
    inputDot: () => dispatch({ type: 'dot' }),
    inputOperator: operator => dispatch({ type: 'operator', operator }),
    clear: () => dispatch({ type: 'clear' }),
    backspace: () => dispatch({ type: 'backspace' }),
    commit: () => dispatch({ type: 'equals' }),
  }
}
