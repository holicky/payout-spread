export function relativeTime(diffMs: number): string {
  const sec = Math.max(0, Math.floor(diffMs / 1000))
  if (sec < 30) return 'just now'
  if (sec < 60) return 'less than a minute ago'
  const min = Math.floor(sec / 60)
  if (min === 1) return '1 minute ago'
  if (min < 60) return `${min} minutes ago`
  const hour = Math.floor(min / 60)
  if (hour === 1) return '1 hour ago'
  if (hour < 24) return `${hour} hours ago`
  const day = Math.floor(hour / 24)
  if (day === 1) return 'yesterday'
  return `${day} days ago`
}
