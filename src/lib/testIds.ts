export const TEST_IDS = {
  screen: {
    converter: 'screen.converter',
    timing: 'screen.timing',
    today: 'screen.today',
  },
  tab: {
    converter: 'tab.converter',
    timing: 'tab.timing',
    today: 'tab.today',
  },
  converter: {
    form: 'converter.form',
    sourceCurrency: 'converter.source.currency',
    sourceAmount: 'converter.source.amount',
    targetCurrency: 'converter.target.currency',
    targetAmount: 'converter.target.amount',
    swap: 'converter.swap',
    history: 'converter.history',
    timingCta: 'converter.timingCta',
  },
  rates: {
    list: 'rates.list',
    referenceCurrency: 'rates.referenceCurrency',
    card: (code: string) => `rates.card.${code}`,
  },
  picker: {
    modal: 'currencyPicker.modal',
    close: 'currencyPicker.close',
    search: 'currencyPicker.search',
    list: 'currencyPicker.list',
    row: (code: string) => `currencyPicker.row.${code}`,
    indexLetter: (letter: string) => `currencyPicker.index.${letter}`,
  },
  keypad: {
    modal: 'calculatorKeypad.modal',
    backdrop: 'calculatorKeypad.backdrop',
    key: (label: string) => `calculatorKeypad.key.${sanitize(label)}`,
  },
  common: {
    refreshRates: 'rates.refresh',
    retryRates: 'rates.retry',
    period: (label: string) => `period.${label}`,
  },
} as const

function sanitize(value: string): string {
  return value
    .replace('÷', 'divide')
    .replace('×', 'multiply')
    .replace('−', 'subtract')
    .replace('+', 'add')
    .replace('.', 'decimal')
    .replace(/\s+/g, '-')
    .toLowerCase()
}
