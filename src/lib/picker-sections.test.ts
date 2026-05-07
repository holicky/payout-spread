import type { CurrencyRate } from '../api/cnb/types'
import { buildSections } from './picker-sections'

const r = (
  code: string,
  country: string,
  currencyName: string,
): CurrencyRate => ({
  country,
  currencyName,
  amount: 1,
  code,
  rate: 1,
})

const rates: CurrencyRate[] = [
  r('USD', 'USA', 'dollar'),
  r('EUR', 'EMU', 'euro'),
  r('GBP', 'United Kingdom', 'pound'),
  r('AUD', 'Australia', 'dollar'),
  r('JPY', 'Japan', 'yen'),
]

describe('buildSections', () => {
  it('returns one section per starting letter (using friendly name, not code)', () => {
    const sections = buildSections(rates, '')
    const letters = sections.map(s => s.letter)
    // Australian Dollar -> A, British Pound -> B, Euro -> E, Japanese Yen -> J, US Dollar -> U
    expect(letters).toEqual(['A', 'B', 'E', 'J', 'U'])
  })

  it('sorts entries alphabetically by display name within each section', () => {
    const sections = buildSections(rates, '')
    const flat = sections.flatMap(s => s.data.map(r => r.code))
    expect(flat).toEqual(['AUD', 'GBP', 'EUR', 'JPY', 'USD'])
  })

  it('matches by display name (case insensitive)', () => {
    const sections = buildSections(rates, 'dollar')
    const codes = sections.flatMap(s => s.data.map(r => r.code))
    expect(codes).toContain('USD')
    expect(codes).toContain('AUD')
    expect(codes).not.toContain('EUR')
  })

  it('matches by currency code', () => {
    const sections = buildSections(rates, 'eur')
    const codes = sections.flatMap(s => s.data.map(r => r.code))
    expect(codes).toEqual(['EUR'])
  })

  it('returns no sections when nothing matches', () => {
    expect(buildSections(rates, 'klingon')).toEqual([])
  })

  it('treats empty query as match-all', () => {
    const total = buildSections(rates, '').reduce(
      (n, s) => n + s.data.length,
      0,
    )
    expect(total).toBe(rates.length)
  })

  it('trims whitespace in queries', () => {
    const sections = buildSections(rates, '  eur  ')
    expect(sections.flatMap(s => s.data.map(r => r.code))).toEqual(['EUR'])
  })
})
