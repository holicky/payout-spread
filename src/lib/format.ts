export function formatNumber(n: number, fractionDigits: number = 2): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d} ${SHORT_MONTHS[Number(m) - 1]} ${y}`
}

export function shortDate(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}
