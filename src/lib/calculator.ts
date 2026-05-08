export type CalculatorOperator = '+' | '-' | '*' | '/'

export type CalculatorState = {
  display: string
  pendingValue: number | null
  pendingOperator: CalculatorOperator | null
  resetOnNextDigit: boolean
}

export const INITIAL_STATE: CalculatorState = {
  display: '0',
  pendingValue: null,
  pendingOperator: null,
  resetOnNextDigit: false,
}

export type CalculatorAction =
  | { type: 'digit'; value: string }
  | { type: 'dot' }
  | { type: 'operator'; operator: CalculatorOperator }
  | { type: 'clear' }
  | { type: 'backspace' }
  | { type: 'equals' }
  | { type: 'seed'; value: string }

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  switch (action.type) {
    case 'digit': {
      if (state.resetOnNextDigit) {
        return { ...state, display: action.value, resetOnNextDigit: false }
      }
      const next =
        state.display === '0' ? action.value : state.display + action.value
      return { ...state, display: next }
    }
    case 'dot': {
      if (state.resetOnNextDigit) {
        return { ...state, display: '0.', resetOnNextDigit: false }
      }
      if (state.display.includes('.')) return state
      return { ...state, display: state.display + '.' }
    }
    case 'operator': {
      const current = parseFloat(state.display) || 0
      let nextDisplay = state.display
      let nextPendingValue = state.pendingValue
      if (state.pendingOperator != null && !state.resetOnNextDigit) {
        const result = applyOperator(
          state.pendingValue ?? 0,
          current,
          state.pendingOperator,
        )
        nextDisplay = formatResult(result)
        nextPendingValue = result
      } else {
        nextPendingValue = current
      }
      return {
        display: nextDisplay,
        pendingValue: nextPendingValue,
        pendingOperator: action.operator,
        resetOnNextDigit: true,
      }
    }
    case 'clear':
      return INITIAL_STATE
    case 'backspace': {
      if (state.resetOnNextDigit) {
        // Cancel the pending operator rather than mutating the frozen left operand.
        return { ...state, pendingOperator: null, resetOnNextDigit: false }
      }
      const next = state.display.slice(0, -1)
      const finalNext = next === '' || next === '-' ? '0' : next
      return { ...state, display: finalNext }
    }
    case 'equals': {
      // No second operand typed yet; commit reports just the left operand.
      if (state.pendingOperator == null || state.resetOnNextDigit) return state
      const result = applyOperator(
        state.pendingValue ?? 0,
        parseFloat(state.display) || 0,
        state.pendingOperator,
      )
      return {
        display: formatResult(result),
        pendingValue: null,
        pendingOperator: null,
        resetOnNextDigit: false,
      }
    }
    case 'seed': {
      const value = evaluateExpression(action.value)
      return {
        display: value == null ? '0' : formatResult(value),
        pendingValue: null,
        pendingOperator: null,
        resetOnNextDigit: true,
      }
    }
  }
}

export function applyOperator(
  left: number,
  right: number,
  operator: CalculatorOperator,
): number {
  switch (operator) {
    case '+':
      return left + right
    case '-':
      return left - right
    case '*':
      return left * right
    case '/':
      return right === 0 ? 0 : left / right
  }
}

export function operatorLabel(operator: CalculatorOperator): string {
  return operator === '+'
    ? '+'
    : operator === '-'
      ? '−'
      : operator === '*'
        ? '×'
        : '÷'
}

export function formatResult(value: number): string {
  if (!Number.isFinite(value)) return '0'
  // Trim float dust without ever printing scientific notation in our range.
  return String(Math.round(value * 1e8) / 1e8)
}

/**
 * Render the live expression for display in the parent input:
 *   no pending operator                → just the current operand
 *   pending operator, no right operand → "left operator"
 *   pending operator, right operand    → "left operator right"
 */
export function expressionFor(state: CalculatorState): string {
  if (!state.pendingOperator) return state.display
  const leftOperand = formatResult(state.pendingValue ?? 0)
  const operator = operatorLabel(state.pendingOperator)
  if (state.resetOnNextDigit) return `${leftOperand} ${operator}`
  return `${leftOperand} ${operator} ${state.display}`
}

/**
 * Evaluate a textual expression like "9", "9 - 5", "100 + 50 × 2" or a partial
 * one like "9 -" (trailing operator dropped). Left-to-right, no precedence —
 * matches the in-app calculator. Returns null for empty/invalid input.
 */
export function evaluateExpression(text: string): number | null {
  if (!text) return null
  const cleaned = text.trim().replace(/,/g, '.')
  if (!cleaned) return null
  // Normalize the fancy operator glyphs the keypad emits.
  const normalized = cleaned
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')

  const tokens = normalized.match(/(\d+\.?\d*|\.\d+|[+\-*/])/g)
  if (!tokens || tokens.length === 0) return null

  // Drop trailing operator(s) — incomplete expression is OK.
  while (tokens.length > 0 && /^[+\-*/]$/.test(tokens[tokens.length - 1]!)) {
    tokens.pop()
  }
  if (tokens.length === 0) return null

  const first = parseFloat(tokens[0]!)
  if (!Number.isFinite(first)) return null
  let result = first
  for (let i = 1; i + 1 < tokens.length; i += 2) {
    const operator = tokens[i] as CalculatorOperator
    const operand = parseFloat(tokens[i + 1]!)
    if (!Number.isFinite(operand)) return null
    result = applyOperator(result, operand, operator)
  }
  return result
}
