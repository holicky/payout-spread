import type { CurrencyRate } from '../api/cnb/types'
import { nameFor } from './currency-names'

export type CurrencySection = {
  letter: string
  data: CurrencyRate[]
}

export function buildSections(
  rates: CurrencyRate[],
  query: string,
): CurrencySection[] {
  const displayName = (rate: CurrencyRate) =>
    nameFor(rate.code, rate.currencyName)
  const normalizedQuery = query.trim().toLowerCase()

  const matched = rates.filter(rate => {
    if (!normalizedQuery) return true
    return (
      displayName(rate).toLowerCase().includes(normalizedQuery) ||
      rate.code.toLowerCase().includes(normalizedQuery)
    )
  })

  const sorted = [...matched].sort((left, right) =>
    displayName(left).localeCompare(displayName(right)),
  )

  const byLetter = new Map<string, CurrencyRate[]>()
  for (const rate of sorted) {
    const letter = displayName(rate)[0]?.toUpperCase() ?? '#'
    if (!byLetter.has(letter)) byLetter.set(letter, [])
    byLetter.get(letter)!.push(rate)
  }

  return Array.from(byLetter.entries()).map(([letter, data]) => ({
    letter,
    data,
  }))
}
