import { readFileSync } from 'fs'
import { join } from 'path'
import { CNBParseError, parseCNBDaily, parseCNBYear } from './parser'

const realFixture = readFileSync(
  join(__dirname, '__fixtures__', 'cnb-2026-05-06.txt'),
  'utf-8',
)
const realYearFixture = readFileSync(
  join(__dirname, '__fixtures__', 'cnb-year-2026.txt'),
  'utf-8',
)

describe('parseCNBDaily', () => {
  describe('with real CNB fixture', () => {
    const result = parseCNBDaily(realFixture)

    it('parses the date as ISO YYYY-MM-DD', () => {
      expect(result.date).toBe('2026-05-06')
    })

    it('extracts the sequence number', () => {
      expect(result.sequenceNumber).toBe(86)
    })

    it('returns all 30 rate rows', () => {
      expect(result.rates).toHaveLength(30)
    })

    it('parses USD with amount=1', () => {
      const usd = result.rates.find(r => r.code === 'USD')
      expect(usd).toEqual({
        country: 'USA',
        currencyName: 'dollar',
        amount: 1,
        code: 'USD',
        rate: 20.7,
      })
    })

    it('parses JPY with amount=100', () => {
      const jpy = result.rates.find(r => r.code === 'JPY')
      expect(jpy).toEqual({
        country: 'Japan',
        currencyName: 'yen',
        amount: 100,
        code: 'JPY',
        rate: 13.249,
      })
    })

    it('parses IDR with amount=1000', () => {
      const idr = result.rates.find(r => r.code === 'IDR')
      expect(idr).toEqual({
        country: 'Indonesia',
        currencyName: 'rupiah',
        amount: 1000,
        code: 'IDR',
        rate: 1.191,
      })
    })

    it('preserves multi-word country and currency names', () => {
      expect(result.rates.find(r => r.code === 'ILS')?.currencyName).toBe(
        'new shekel',
      )
      expect(result.rates.find(r => r.code === 'NZD')?.country).toBe(
        'New Zealand',
      )
    })

    it('includes the IMF SDR (XDR) row', () => {
      expect(result.rates.find(r => r.code === 'XDR')).toBeDefined()
    })
  })

  describe('error cases', () => {
    it('throws on empty input', () => {
      expect(() => parseCNBDaily('')).toThrow(CNBParseError)
    })

    it('throws on input with only one line', () => {
      expect(() => parseCNBDaily('06 May 2026 #86')).toThrow(CNBParseError)
    })

    it('throws on malformed date header', () => {
      expect(() =>
        parseCNBDaily('not a date\nCountry|Currency|Amount|Code|Rate'),
      ).toThrow(/malformed date header/)
    })

    it('throws on unknown month name', () => {
      expect(() =>
        parseCNBDaily('06 Mayy 2026 #86\nCountry|Currency|Amount|Code|Rate'),
      ).toThrow(/unknown month name/)
    })

    it('throws on missing column header', () => {
      expect(() => parseCNBDaily('06 May 2026 #86\nWrong|Header')).toThrow(
        /unexpected column header/,
      )
    })

    it('throws on row with wrong column count', () => {
      const input = [
        '06 May 2026 #86',
        'Country|Currency|Amount|Code|Rate',
        'USA|dollar|1|USD',
      ].join('\n')
      expect(() => parseCNBDaily(input)).toThrow(/expected 5 columns/)
    })

    it('throws on negative amount', () => {
      const input = [
        '06 May 2026 #86',
        'Country|Currency|Amount|Code|Rate',
        'USA|dollar|-1|USD|20.700',
      ].join('\n')
      expect(() => parseCNBDaily(input)).toThrow(/invalid amount/)
    })

    it('throws on non-numeric rate', () => {
      const input = [
        '06 May 2026 #86',
        'Country|Currency|Amount|Code|Rate',
        'USA|dollar|1|USD|not-a-number',
      ].join('\n')
      expect(() => parseCNBDaily(input)).toThrow(/invalid rate/)
    })

    it('throws on lowercase currency code', () => {
      const input = [
        '06 May 2026 #86',
        'Country|Currency|Amount|Code|Rate',
        'USA|dollar|1|usd|20.700',
      ].join('\n')
      expect(() => parseCNBDaily(input)).toThrow(/invalid currency code/)
    })
  })

  describe('month name formats', () => {
    const minimalRow = 'USA|dollar|1|USD|20.700'
    const columnHeader = 'Country|Currency|Amount|Code|Rate'

    it('accepts full month names (today endpoint)', () => {
      const result = parseCNBDaily(
        `06 April 2026 #86\n${columnHeader}\n${minimalRow}`,
      )
      expect(result.date).toBe('2026-04-06')
    })

    it('accepts 3-letter month abbreviations (date-parameterized endpoint)', () => {
      const result = parseCNBDaily(
        `06 Apr 2026 #86\n${columnHeader}\n${minimalRow}`,
      )
      expect(result.date).toBe('2026-04-06')
    })

    it('accepts "May" (same in both forms)', () => {
      const result = parseCNBDaily(
        `06 May 2026 #86\n${columnHeader}\n${minimalRow}`,
      )
      expect(result.date).toBe('2026-05-06')
    })
  })

  describe('whitespace tolerance', () => {
    it('handles trailing newline', () => {
      const input =
        '06 May 2026 #86\nCountry|Currency|Amount|Code|Rate\nUSA|dollar|1|USD|20.700\n'
      expect(() => parseCNBDaily(input)).not.toThrow()
    })

    it('handles CRLF line endings', () => {
      const input =
        '06 May 2026 #86\r\nCountry|Currency|Amount|Code|Rate\r\nUSA|dollar|1|USD|20.700\r\n'
      const result = parseCNBDaily(input)
      expect(result.rates).toHaveLength(1)
    })
  })
})

describe('parseCNBYear', () => {
  it('parses yearly rows into daily fixings using header currency specs', () => {
    const result = parseCNBYear(
      [
        'Date|1 AUD|100 JPY|1 USD',
        '02.01.2026|14.100|13.249|20.700',
        '05.01.2026|14.200|13.300|20.800',
      ].join('\n'),
    )

    expect(result).toEqual([
      {
        date: '2026-01-02',
        sequenceNumber: 1,
        rates: [
          {
            country: '',
            currencyName: 'AUD',
            amount: 1,
            code: 'AUD',
            rate: 14.1,
          },
          {
            country: '',
            currencyName: 'JPY',
            amount: 100,
            code: 'JPY',
            rate: 13.249,
          },
          {
            country: '',
            currencyName: 'USD',
            amount: 1,
            code: 'USD',
            rate: 20.7,
          },
        ],
      },
      {
        date: '2026-01-05',
        sequenceNumber: 2,
        rates: [
          {
            country: '',
            currencyName: 'AUD',
            amount: 1,
            code: 'AUD',
            rate: 14.2,
          },
          {
            country: '',
            currencyName: 'JPY',
            amount: 100,
            code: 'JPY',
            rate: 13.3,
          },
          {
            country: '',
            currencyName: 'USD',
            amount: 1,
            code: 'USD',
            rate: 20.8,
          },
        ],
      },
    ])
  })

  it('accepts a repeated header when CNB changes the yearly structure', () => {
    const result = parseCNBYear(
      [
        'Date|1 USD',
        '02.01.2026|20.700',
        'Date|1 USD|1 EUR',
        '05.01.2026|20.800|25.100',
      ].join('\n'),
    )

    expect(result).toHaveLength(2)
    expect(result[0].rates.map(rate => rate.code)).toEqual(['USD'])
    expect(result[1].rates.map(rate => rate.code)).toEqual(['USD', 'EUR'])
  })

  it('parses a captured real CNB year.txt fixture', () => {
    const result = parseCNBYear(realYearFixture)

    expect(result.length).toBeGreaterThan(80)
    const firstFixing = result[0]
    expect(firstFixing.date).toBe('2026-01-02')

    const usd = firstFixing.rates.find(rate => rate.code === 'USD')
    const jpy = firstFixing.rates.find(rate => rate.code === 'JPY')
    const eur = firstFixing.rates.find(rate => rate.code === 'EUR')
    expect(usd).toMatchObject({ amount: 1, rate: 20.611 })
    expect(jpy).toMatchObject({ amount: 100, rate: 13.141 })
    expect(eur).toMatchObject({ amount: 1, rate: 24.17 })
  })

  it('throws on malformed yearly input', () => {
    expect(() => parseCNBYear('')).toThrow(CNBParseError)
    expect(() => parseCNBYear('Date|USD\n02.01.2026|20.700')).toThrow(
      /malformed currency spec/,
    )
    expect(() => parseCNBYear('Date|1 USD\n2026-01-02|20.700')).toThrow(
      /malformed date/,
    )
    expect(() => parseCNBYear('Date|1 USD\n02.01.2026|bad')).toThrow(
      /invalid rate/,
    )
  })
})
