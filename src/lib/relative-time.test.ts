import { relativeTime } from './relative-time'

const SEC = 1000
const MIN = 60 * SEC
const HOUR = 60 * MIN
const DAY = 24 * HOUR

describe('relativeTime', () => {
  it('clamps negative diffs to "just now"', () => {
    expect(relativeTime(-5_000)).toBe('just now')
  })

  it('returns "just now" under 30 seconds', () => {
    expect(relativeTime(0)).toBe('just now')
    expect(relativeTime(29 * SEC)).toBe('just now')
  })

  it('returns "less than a minute ago" between 30 and 59 seconds', () => {
    expect(relativeTime(30 * SEC)).toBe('less than a minute ago')
    expect(relativeTime(59 * SEC)).toBe('less than a minute ago')
  })

  it('uses singular for exactly 1 minute', () => {
    expect(relativeTime(MIN)).toBe('1 minute ago')
    expect(relativeTime(MIN + 30 * SEC)).toBe('1 minute ago')
  })

  it('pluralizes minutes from 2 to 59', () => {
    expect(relativeTime(2 * MIN)).toBe('2 minutes ago')
    expect(relativeTime(59 * MIN)).toBe('59 minutes ago')
  })

  it('uses singular for exactly 1 hour', () => {
    expect(relativeTime(HOUR)).toBe('1 hour ago')
    expect(relativeTime(HOUR + 30 * MIN)).toBe('1 hour ago')
  })

  it('pluralizes hours from 2 to 23', () => {
    expect(relativeTime(2 * HOUR)).toBe('2 hours ago')
    expect(relativeTime(23 * HOUR)).toBe('23 hours ago')
  })

  it('returns "yesterday" for exactly 1 day', () => {
    expect(relativeTime(DAY)).toBe('yesterday')
    expect(relativeTime(DAY + 6 * HOUR)).toBe('yesterday')
  })

  it('returns "N days ago" for 2+ days', () => {
    expect(relativeTime(2 * DAY)).toBe('2 days ago')
    expect(relativeTime(30 * DAY)).toBe('30 days ago')
  })
})
