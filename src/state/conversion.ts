import { create } from 'zustand'

import { evaluateExpression } from '../lib/calculator'

type ConversionState = {
  amount: string
  sourceCode: string
  targetCode: string
  setAmount: (value: string) => void
  setSourceCode: (code: string) => void
  setTargetCode: (code: string) => void
  swap: () => void
}

export const useConversionStore = create<ConversionState>(set => ({
  amount: '100',
  sourceCode: 'CZK',
  targetCode: 'USD',
  setAmount: amount => set({ amount }),
  setSourceCode: sourceCode => set({ sourceCode }),
  setTargetCode: targetCode => set({ targetCode }),
  swap: () =>
    set(state => ({
      sourceCode: state.targetCode,
      targetCode: state.sourceCode,
    })),
}))

export function useEvaluatedAmount(): number | null {
  const amount = useConversionStore(s => s.amount)
  return evaluateExpression(amount)
}
