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

export async function fetchDailyRatesAt(
  date: Date,
  signal?: AbortSignal,
): Promise<CnbDailyFixing> {
  const url = `${CNB_DAILY_URL}?date=${formatCnbDate(date)}`
  return fetchAt(url, signal)
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

/**
 * Calendar days needed to cover N business days. Weekends drop ~2/7 of days
 * and the +3 buffer absorbs typical Czech bank holidays.
 */
export function calendarDaysFor(businessDays: number): number {
  return Math.ceil(businessDays * 1.6) + 3
}

export function formatCnbDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

// Soft semaphore — caps concurrent in-flight requests so we don't hammer the
// CNB host. FIFO is best-effort; not worth strict ordering at this volume.
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
