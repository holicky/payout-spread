export type CurrencyRate = {
  country: string
  currencyName: string
  /** units of foreign currency the rate is quoted for (1, 100, or 1000) */
  amount: number
  code: string
  /** CZK per `amount` units of foreign currency */
  rate: number
}

export type CnbDailyFixing = {
  /** ISO 8601 date (YYYY-MM-DD) of the fixing */
  date: string
  /** sequence number CNB assigns to each daily fixing within a year */
  sequenceNumber: number
  rates: CurrencyRate[]
}
