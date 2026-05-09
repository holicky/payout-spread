import { create } from 'zustand'

import { evaluateExpression } from '../lib/calculator'

export type EditingSide = 'source' | 'target'

type ConversionState = {
  amount: string
  sourceCode: string
  targetCode: string
  editingSide: EditingSide
  setAmount: (value: string) => void
  setSourceCode: (code: string) => void
  setTargetCode: (code: string) => void
  setEditingSide: (side: EditingSide) => void
  swap: () => void
}

export const useConversionStore = create<ConversionState>(set => ({
  amount: '100',
  sourceCode: 'CZK',
  targetCode: 'USD',
  editingSide: 'source',
  setAmount: amount => set({ amount }),
  setSourceCode: sourceCode => set({ sourceCode }),
  setTargetCode: targetCode => set({ targetCode }),
  setEditingSide: editingSide => set({ editingSide }),
  swap: () =>
    set(state => ({
      sourceCode: state.targetCode,
      targetCode: state.sourceCode,
      editingSide: state.editingSide === 'source' ? 'target' : 'source',
    })),
}))

export function useEvaluatedAmount(): number | null {
  const amount = useConversionStore(state => state.amount)
  return evaluateExpression(amount)
}
