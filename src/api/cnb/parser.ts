import type { CNBDailyFixing, CurrencyRate } from './types'

export class CNBParseError extends Error {
  constructor(message: string) {
    super(`CNB parse error: ${message}`)
    this.name = 'CNBParseError'
  }
}

const HEADER_RE = /^(\d{1,2})\s+(\w+)\s+(\d{4})\s+#(\d+)\s*$/
const COLUMN_HEADER = 'Country|Currency|Amount|Code|Rate'
const YEAR_DATE_HEADER = 'Date'
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

// CNB's "today" endpoint emits full month names ("April"); the date-parameterized
// endpoint emits 3-letter abbreviations ("Apr"). Accept both.
const MONTH_INDEX = new Map<string, number>(
  MONTHS.flatMap((name, index) => [
    [name, index],
    [name.slice(0, 3), index],
  ]),
)

export function parseCNBDaily(input: string): CNBDailyFixing {
  const lines = input
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    throw new CNBParseError('input too short to contain header + columns')
  }

  const headerMatch = lines[0].match(HEADER_RE)
  if (!headerMatch) {
    throw new CNBParseError(`malformed date header: "${lines[0]}"`)
  }
  const [, day, monthName, year, seq] = headerMatch
  const monthIndex = MONTH_INDEX.get(monthName)
  if (monthIndex === undefined) {
    throw new CNBParseError(`unknown month name: "${monthName}"`)
  }
  const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${day.padStart(2, '0')}`
  const sequenceNumber = Number(seq)

  if (lines[1] !== COLUMN_HEADER) {
    throw new CNBParseError(`unexpected column header: "${lines[1]}"`)
  }

  const rates = lines
    .slice(2)
    .map((line, index) => parseRateRow(line, index + 1))

  return { date, sequenceNumber, rates }
}

export function parseCNBYear(input: string): CNBDailyFixing[] {
  const lines = input
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    throw new CNBParseError('year input too short to contain header + rows')
  }

  let currentSpecs: YearRateSpec[] | null = null
  const fixings: CNBDailyFixing[] = []

  for (const line of lines) {
    const cols = line.split('|')
    if (cols[0] === YEAR_DATE_HEADER) {
      currentSpecs = parseYearHeader(cols)
      continue
    }

    if (!currentSpecs) {
      throw new CNBParseError('year data row encountered before header')
    }
    const rowNumber = fixings.length + 1
    if (cols.length !== currentSpecs.length + 1) {
      throw new CNBParseError(
        `year row ${rowNumber}: expected ${currentSpecs.length + 1} columns, got ${cols.length}`,
      )
    }

    // year.txt omits country and currency name; use code as a placeholder so
    // the type lines up with daily fixings. Display surfaces (RateCard, picker)
    // must source their labels from the daily endpoint, not from here.
    fixings.push({
      date: parseYearDate(cols[0]!, rowNumber),
      sequenceNumber: rowNumber,
      rates: currentSpecs.map((spec, index) => {
        const rateStr = cols[index + 1]!
        const rate = Number(rateStr)
        if (!Number.isFinite(rate) || rate <= 0) {
          throw new CNBParseError(
            `year row ${rowNumber}: invalid rate "${rateStr}" for ${spec.code}`,
          )
        }
        return {
          country: '',
          currencyName: spec.code,
          amount: spec.amount,
          code: spec.code,
          rate,
        }
      }),
    })
  }

  return fixings
}

function parseRateRow(line: string, rowNumber: number): CurrencyRate {
  const cols = line.split('|')
  if (cols.length !== 5) {
    throw new CNBParseError(
      `row ${rowNumber}: expected 5 columns, got ${cols.length}`,
    )
  }
  const [country, currencyName, amountStr, code, rateStr] = cols
  const amount = Number(amountStr)
  const rate = Number(rateStr)
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new CNBParseError(`row ${rowNumber}: invalid amount "${amountStr}"`)
  }
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new CNBParseError(`row ${rowNumber}: invalid rate "${rateStr}"`)
  }
  if (!/^[A-Z]{3}$/.test(code)) {
    throw new CNBParseError(`row ${rowNumber}: invalid currency code "${code}"`)
  }
  return { country, currencyName, amount, code, rate }
}

type YearRateSpec = Pick<CurrencyRate, 'amount' | 'code'>

function parseYearHeader(cols: string[]): YearRateSpec[] {
  if (cols[0] !== YEAR_DATE_HEADER || cols.length < 2) {
    throw new CNBParseError('malformed year header')
  }

  return cols.slice(1).map((col, index) => {
    const match = col.match(/^(\d+)\s+([A-Z]{3})$/)
    if (!match) {
      throw new CNBParseError(
        `year header column ${index + 2}: malformed currency spec "${col}"`,
      )
    }
    const [, amountStr, code] = match
    const amount = Number(amountStr)
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new CNBParseError(
        `year header column ${index + 2}: invalid amount "${amountStr}"`,
      )
    }
    return { amount, code }
  })
}

function parseYearDate(value: string, rowNumber: number): string {
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!match) {
    throw new CNBParseError(`year row ${rowNumber}: malformed date "${value}"`)
  }
  const [, day, month, year] = match
  return `${year}-${month}-${day}`
}
