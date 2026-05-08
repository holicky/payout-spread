export const colors = {
  text: '#111',
  textMuted: '#6b7280',
  textSubtle: '#9ca3af',
  border: '#e5e7eb',
  borderSoft: '#f1f3f5',
  surface: '#fff',
  surfaceMuted: '#f5f6f8',
  surfaceSoft: '#fafafa',
  accent: '#6643f0',
  accentSoft: '#eff6ff',
  accentDeep: '#4b35b6',
  accentDark: '#4c2097',
  positive: '#15b340',
  negative: '#bf2028',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const

export const touch = {
  minTarget: 44,
} as const

export const radii = {
  sm: 8,
  md: 12,
  lg: 14,
  pill: 999,
} as const

export const screenContent = {
  backgroundColor: colors.surfaceMuted,
  borderTopLeftRadius: radii.lg + 10,
  borderTopRightRadius: radii.lg + 10,
  flexGrow: 1,
}

export const topEdgeShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -1 },
  shadowOpacity: 0.04,
  shadowRadius: 4,
  elevation: 4,
} as const
