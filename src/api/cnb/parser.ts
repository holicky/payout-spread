import type { CNBDailyFixing, CurrencyRate } from './types'

export class CNBParseError extends Error {
  constructor(message: string) {
    super(`CNB parse error: ${message}`)
    this.name = 'CNBParseError'
  }
}

const HEADER_RE = /^(\d{1,2})\s+(\w+)\s+(\d{4})\s+#(\d+)\s*$/
const COLUMN_HEADER = 'Country|Currency|Amount|Code|Rate'
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
