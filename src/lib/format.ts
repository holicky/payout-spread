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

const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d} ${SHORT_MONTHS[Number(m) - 1]} ${y}`
}

export function formatLongDateWithWeekday(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  // Construct at local midnight to avoid timezone-shift weekday drift.
  const weekday = SHORT_WEEKDAYS[new Date(y!, m! - 1, d!).getDay()]
  return `${weekday}, ${formatLongDate(iso)}`
}

export function shortDate(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}
