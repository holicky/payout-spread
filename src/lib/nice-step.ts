export function niceStep(target: number): number {
  if (target <= 0) return 1
  const exp = Math.floor(Math.log10(target))
  const base = Math.pow(10, exp)
  const mantissa = target / base
  if (mantissa < 1.5) return 1 * base
  if (mantissa < 3) return 2 * base
  if (mantissa < 7) return 5 * base
  return 10 * base
}
