import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import { colors, spacing } from '../theme'

type Props = {
  title: string
}

export function ScreenHeader({ title }: Props) {
  const insets = useSafeAreaInsets()
  return (
    <LinearGradient
      colors={[colors.accentDeep, colors.accent]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <Inner style={{ paddingTop: insets.top + spacing.md }}>
        <Title>{title}</Title>
      </Inner>
    </LinearGradient>
  )
}

const Inner = styled.View`
  padding: ${spacing.md}px ${spacing.lg}px ${spacing.xl}px;
`

const Title = styled.Text`
  color: ${colors.surface};
  font-size: 28px;
  font-weight: 700;
`
