import { parseCnbDaily } from './parser'
import type { CnbDailyFixing } from './types'

const CNB_DAILY_URL =
  'https://www.cnb.cz/en/financial-markets/foreign-exchange-market/central-bank-exchange-rate-fixing/central-bank-exchange-rate-fixing/daily.txt'
const REQUEST_TIMEOUT_MS = 15_000
const MAX_PARALLEL_CNB_REQUESTS = 6

let activeRequests = 0
const requestQueue: Array<() => void> = []

export class CnbFetchError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(`CNB fetch error: ${message}`)
    this.name = 'CnbFetchError'
  }
}

export async function fetchDailyRates(
  signal?: AbortSignal,
): Promise<CnbDailyFixing> {
  return fetchAt(CNB_DAILY_URL, signal)
}

export async function fetchDailyRatesAt(
  date: Date,
  signal?: AbortSignal,
): Promise<CnbDailyFixing> {
  const url = `${CNB_DAILY_URL}?date=${formatCnbDate(date)}`
  return fetchAt(url, signal)
}

export async function fetchRecentDailyRates(
  businessDays: number,
  signal?: AbortSignal,
): Promise<CnbDailyFixing[]> {
  const calendarDays = Math.ceil(businessDays * 1.6) + 3
  const today = new Date()
  const dates = Array.from({ length: calendarDays }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    return d
  })

  const settled = await Promise.allSettled(
    dates.map(d => fetchDailyRatesAt(d, signal)),
  )
  const fixings = settled.flatMap(result =>
    result.status === 'fulfilled' ? [result.value] : [],
  )

  if (fixings.length === 0) {
    const firstError = settled.find(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    )?.reason
    throw firstError instanceof Error
      ? firstError
      : new CnbFetchError('all recent fixing requests failed')
  }

  const byDate = new Map<string, CnbDailyFixing>()
  for (const f of fixings) byDate.set(f.date, f)

  return Array.from(byDate.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-businessDays)
}

async function fetchAt(
  url: string,
  signal?: AbortSignal,
): Promise<CnbDailyFixing> {
  const res = await withCnbRequestSlot(() => fetchWithTimeout(url, signal))
  if (!res.ok) {
    throw new CnbFetchError(`HTTP ${res.status}`, res.status)
  }
  const body = await res.text()
  return parseCnbDaily(body)
}

export function formatCnbDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

async function withCnbRequestSlot<T>(run: () => Promise<T>): Promise<T> {
  if (activeRequests >= MAX_PARALLEL_CNB_REQUESTS) {
    await new Promise<void>(resolve => requestQueue.push(resolve))
  }

  activeRequests += 1
  try {
    return await run()
  } finally {
    activeRequests -= 1
    requestQueue.shift()?.()
  }
}

async function fetchWithTimeout(
  url: string,
  signal?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  const abortFromParent = () => controller.abort()
  if (signal?.aborted) controller.abort()
  else signal?.addEventListener('abort', abortFromParent, { once: true })

  try {
    return await fetch(url, { signal: controller.signal })
  } catch (error) {
    if (controller.signal.aborted && !signal?.aborted) {
      throw new CnbFetchError('request timed out')
    }
    throw error
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abortFromParent)
  }
}
