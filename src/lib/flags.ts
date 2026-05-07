// Currency code -> ISO 3166-1 alpha-2 country code, used to build flagcdn URLs.
const CURRENCY_TO_COUNTRY: Record<string, string> = {
  AUD: 'AU',
  BRL: 'BR',
  CAD: 'CA',
  CHF: 'CH',
  CNY: 'CN',
  CZK: 'CZ',
  DKK: 'DK',
  EUR: 'EU',
  GBP: 'GB',
  HKD: 'HK',
  HUF: 'HU',
  IDR: 'ID',
  ILS: 'IL',
  INR: 'IN',
  ISK: 'IS',
  JPY: 'JP',
  KRW: 'KR',
  MXN: 'MX',
  MYR: 'MY',
  NOK: 'NO',
  NZD: 'NZ',
  PHP: 'PH',
  PLN: 'PL',
  RON: 'RO',
  SEK: 'SE',
  SGD: 'SG',
  THB: 'TH',
  TRY: 'TR',
  USD: 'US',
  ZAR: 'ZA',
}

// Pick a width close to the largest rendered size on a 3x display, then let
// expo-image cache the bitmap. flagcdn supports: 20, 40, 80, 160, 320, 640.
const DEFAULT_WIDTH = 160

export function flagUrlFor(
  currencyCode: string,
  width: number = DEFAULT_WIDTH,
): string | null {
  const countryCode = CURRENCY_TO_COUNTRY[currencyCode]
  if (!countryCode) return null
  return `https://flagcdn.com/w${width}/${countryCode.toLowerCase()}.png`
}
