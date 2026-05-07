import {
  applyOperator,
  calculatorReducer,
  evaluateExpression,
  expressionFor,
  formatResult,
  INITIAL_STATE,
  operatorLabel,
  type CalculatorState,
  type CalculatorOperator,
} from './calculator'

describe('evaluateExpression', () => {
  it('parses bare numbers', () => {
    expect(evaluateExpression('9')).toBe(9)
    expect(evaluateExpression('9.5')).toBe(9.5)
    expect(evaluateExpression('100.25')).toBe(100.25)
  })

  it('handles comma decimal', () => {
    expect(evaluateExpression('9,5')).toBe(9.5)
  })

  it('evaluates simple expressions', () => {
    expect(evaluateExpression('9 + 5')).toBe(14)
    expect(evaluateExpression('9 - 5')).toBe(4)
    expect(evaluateExpression('9 * 5')).toBe(45)
    expect(evaluateExpression('9 / 5')).toBeCloseTo(1.8, 8)
  })

  it('handles fancy operator glyphs', () => {
    expect(evaluateExpression('9 × 5')).toBe(45)
    expect(evaluateExpression('9 ÷ 5')).toBeCloseTo(1.8, 8)
    expect(evaluateExpression('9 − 5')).toBe(4)
  })

  it('chains left-to-right (no operator precedence)', () => {
    expect(evaluateExpression('10 + 5 × 2')).toBe(30)
  })

  it('drops trailing operators (incomplete expression)', () => {
    expect(evaluateExpression('9 -')).toBe(9)
    expect(evaluateExpression('9 - ')).toBe(9)
    expect(evaluateExpression('9 + 5 *')).toBe(14)
  })

  it('returns null for empty input', () => {
    expect(evaluateExpression('')).toBeNull()
    expect(evaluateExpression('   ')).toBeNull()
  })

  it('returns null for non-numeric garbage', () => {
    expect(evaluateExpression('abc')).toBeNull()
  })

  it('treats divide-by-zero as 0 (matches calculator behaviour)', () => {
    expect(evaluateExpression('5 / 0')).toBe(0)
  })
})

describe('expressionFor', () => {
  it('shows just the display when no pending operator', () => {
    expect(
      expressionFor({
        display: '9',
        pendingValue: null,
        pendingOperator: null,
        resetOnNextDigit: false,
      }),
    ).toBe('9')
  })

  it('shows "left operand operator" while waiting for second operand', () => {
    // BUG REPRO from user: pressing 9 then - should NOT preview "9 - 9".
    const state: CalculatorState = {
      display: '9',
      pendingValue: 9,
      pendingOperator: '-',
      resetOnNextDigit: true,
    }
    expect(expressionFor(state)).toBe('9 −')
  })

  it('shows "left operand operator right operand" while typing second operand', () => {
    const state: CalculatorState = {
      display: '5',
      pendingValue: 9,
      pendingOperator: '-',
      resetOnNextDigit: false,
    }
    expect(expressionFor(state)).toBe('9 − 5')
  })
})

describe('calculatorReducer', () => {
  describe('digit', () => {
    it('replaces "0" instead of appending', () => {
      const next = calculatorReducer(INITIAL_STATE, {
        type: 'digit',
        value: '5',
      })
      expect(next.display).toBe('5')
    })

    it('appends to existing display', () => {
      const next = calculatorReducer(
        { ...INITIAL_STATE, display: '12' },
        { type: 'digit', value: '3' },
      )
      expect(next.display).toBe('123')
    })

    it('replaces when resetOnNextDigit is true', () => {
      const state: CalculatorState = {
        ...INITIAL_STATE,
        display: '99',
        resetOnNextDigit: true,
      }
      const next = calculatorReducer(state, { type: 'digit', value: '5' })
      expect(next.display).toBe('5')
      expect(next.resetOnNextDigit).toBe(false)
    })
  })

  describe('dot', () => {
    it('appends a dot once', () => {
      const a = calculatorReducer(
        { ...INITIAL_STATE, display: '9' },
        { type: 'dot' },
      )
      expect(a.display).toBe('9.')
      const b = calculatorReducer(a, { type: 'dot' })
      expect(b.display).toBe('9.')
    })

    it('starts "0." after an operator', () => {
      const state: CalculatorState = {
        display: '9',
        pendingValue: 9,
        pendingOperator: '+',
        resetOnNextDigit: true,
      }
      const next = calculatorReducer(state, { type: 'dot' })
      expect(next.display).toBe('0.')
      expect(next.resetOnNextDigit).toBe(false)
    })
  })

  describe('operator', () => {
    it('captures the current display as pendingValue', () => {
      const next = calculatorReducer(
        { ...INITIAL_STATE, display: '9' },
        { type: 'operator', operator: '-' },
      )
      expect(next.pendingValue).toBe(9)
      expect(next.pendingOperator).toBe('-')
      expect(next.resetOnNextDigit).toBe(true)
    })

    it('chains: applies pending operator when a new operator follows a typed second operand', () => {
      const state: CalculatorState = {
        display: '5',
        pendingValue: 10,
        pendingOperator: '+',
        resetOnNextDigit: false,
      }
      const next = calculatorReducer(state, { type: 'operator', operator: '*' })
      expect(next.pendingValue).toBe(15)
      expect(next.display).toBe('15')
      expect(next.pendingOperator).toBe('*')
      expect(next.resetOnNextDigit).toBe(true)
    })

    it('replaces pending operator without computing if no second operand was typed', () => {
      // BUG REPRO: 9, -, +  → "9 +", not 9-9+
      const state: CalculatorState = {
        display: '9',
        pendingValue: 9,
        pendingOperator: '-',
        resetOnNextDigit: true,
      }
      const next = calculatorReducer(state, { type: 'operator', operator: '+' })
      expect(next.pendingValue).toBe(9)
      expect(next.pendingOperator).toBe('+')
      expect(next.display).toBe('9')
    })
  })

  describe('equals', () => {
    it('computes pending operator result', () => {
      const state: CalculatorState = {
        display: '5',
        pendingValue: 10,
        pendingOperator: '+',
        resetOnNextDigit: false,
      }
      const next = calculatorReducer(state, { type: 'equals' })
      expect(next.display).toBe('15')
      expect(next.pendingOperator).toBeNull()
      expect(next.pendingValue).toBeNull()
    })

    it('leaves state unchanged when waiting for second operand (BUG: 9 - = should be 9, not 0)', () => {
      const state: CalculatorState = {
        display: '9',
        pendingValue: 9,
        pendingOperator: '-',
        resetOnNextDigit: true,
      }
      const next = calculatorReducer(state, { type: 'equals' })
      expect(next).toBe(state)
    })
  })

  describe('clear', () => {
    it('resets to initial', () => {
      const next = calculatorReducer(
        {
          display: '99',
          pendingValue: 5,
          pendingOperator: '+',
          resetOnNextDigit: true,
        },
        { type: 'clear' },
      )
      expect(next).toEqual(INITIAL_STATE)
    })
  })

  describe('backspace', () => {
    it('removes last char', () => {
      const next = calculatorReducer(
        { ...INITIAL_STATE, display: '123' },
        { type: 'backspace' },
      )
      expect(next.display).toBe('12')
    })

    it('produces "0" when display becomes empty', () => {
      const next = calculatorReducer(
        { ...INITIAL_STATE, display: '5' },
        { type: 'backspace' },
      )
      expect(next.display).toBe('0')
    })

    it('cancels pending operator when in reset mode', () => {
      const state: CalculatorState = {
        display: '9',
        pendingValue: 9,
        pendingOperator: '+',
        resetOnNextDigit: true,
      }
      const next = calculatorReducer(state, { type: 'backspace' })
      expect(next.pendingOperator).toBeNull()
      expect(next.resetOnNextDigit).toBe(false)
      expect(next.display).toBe('9')
    })
  })

  describe('seed', () => {
    it('seeds display from a number string', () => {
      const next = calculatorReducer(INITIAL_STATE, {
        type: 'seed',
        value: '100',
      })
      expect(next.display).toBe('100')
      expect(next.resetOnNextDigit).toBe(true)
    })

    it('evaluates an expression seed', () => {
      const next = calculatorReducer(INITIAL_STATE, {
        type: 'seed',
        value: '10 + 5',
      })
      expect(next.display).toBe('15')
    })

    it('falls back to "0" for empty/invalid', () => {
      expect(
        calculatorReducer(INITIAL_STATE, { type: 'seed', value: '' }).display,
      ).toBe('0')
      expect(
        calculatorReducer(INITIAL_STATE, { type: 'seed', value: 'abc' })
          .display,
      ).toBe('0')
    })
  })
})

describe('helpers', () => {
  it('applyOperator covers all four operators', () => {
    const cases: [number, number, CalculatorOperator, number][] = [
      [3, 2, '+', 5],
      [3, 2, '-', 1],
      [3, 2, '*', 6],
      [6, 2, '/', 3],
    ]
    for (const [left, right, operator, expected] of cases) {
      expect(applyOperator(left, right, operator)).toBe(expected)
    }
  })

  it('operatorLabel returns the rendered glyph', () => {
    expect(operatorLabel('+')).toBe('+')
    expect(operatorLabel('-')).toBe('−')
    expect(operatorLabel('*')).toBe('×')
    expect(operatorLabel('/')).toBe('÷')
  })

  it('formatResult trims float dust', () => {
    expect(formatResult(0.1 + 0.2)).toBe('0.3')
  })
})
