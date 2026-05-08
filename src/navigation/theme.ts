import { DefaultTheme } from '@react-navigation/native'

import { colors } from '../theme'

export const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.accentDeep,
  },
}
