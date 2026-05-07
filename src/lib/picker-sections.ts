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
  const normalizedQuery = query.trim().toLowerCase()
  const matched = rates.filter(rate => {
    if (!normalizedQuery) return true
    const name = nameFor(rate.code, rate.currencyName).toLowerCase()
    return (
      name.includes(normalizedQuery) ||
      rate.code.toLowerCase().includes(normalizedQuery)
    )
  })

  const sorted = [...matched].sort((a, b) =>
    nameFor(a.code, a.currencyName).localeCompare(
      nameFor(b.code, b.currencyName),
    ),
  )

  const byLetter = new Map<string, CurrencyRate[]>()
  for (const rate of sorted) {
    const letter =
      nameFor(rate.code, rate.currencyName)[0]?.toUpperCase() ?? '#'
    if (!byLetter.has(letter)) byLetter.set(letter, [])
    byLetter.get(letter)!.push(rate)
  }

  return Array.from(byLetter.entries()).map(([letter, data]) => ({
    letter,
    data,
  }))
}
