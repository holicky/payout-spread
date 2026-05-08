import { niceStep } from './nice-step'

describe('niceStep', () => {
  it('returns 1 for non-positive targets', () => {
    expect(niceStep(0)).toBe(1)
    expect(niceStep(-5)).toBe(1)
  })

  it('rounds up to 1× base when mantissa < 1.5', () => {
    expect(niceStep(1)).toBe(1)
    expect(niceStep(1.4)).toBe(1)
    expect(niceStep(10)).toBe(10)
    expect(niceStep(14)).toBe(10)
  })

  it('rounds up to 2× base when 1.5 ≤ mantissa < 3', () => {
    expect(niceStep(1.5)).toBe(2)
    expect(niceStep(2)).toBe(2)
    expect(niceStep(2.9)).toBe(2)
    expect(niceStep(250)).toBe(200)
  })

  it('rounds up to 5× base when 3 ≤ mantissa < 7', () => {
    expect(niceStep(3)).toBe(5)
    expect(niceStep(4)).toBe(5)
    expect(niceStep(6.9)).toBe(5)
    expect(niceStep(50)).toBe(50)
  })

  it('rounds up to 10× base when mantissa ≥ 7', () => {
    expect(niceStep(7)).toBe(10)
    expect(niceStep(9)).toBe(10)
    expect(niceStep(70)).toBe(100)
  })

  it('handles fractional magnitudes', () => {
    expect(niceStep(0.5)).toBe(0.5)
    expect(niceStep(0.12)).toBeCloseTo(0.1, 10)
    expect(niceStep(0.04)).toBeCloseTo(0.05, 10)
  })

  it('handles large magnitudes', () => {
    expect(niceStep(12_000)).toBe(10_000)
    expect(niceStep(45_000)).toBe(50_000)
    expect(niceStep(800_000)).toBe(1_000_000)
  })
})
