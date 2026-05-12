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
    <GradientHeader style={{ paddingTop: insets.top + spacing.md }}>
      <Title>{title}</Title>
    </GradientHeader>
  )
}

const GradientHeader = styled(LinearGradient).attrs({
  colors: [colors.accentDeep, colors.accent] as const,
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
})`
  padding-left: ${spacing.lg}px;
  padding-right: ${spacing.lg}px;
  padding-bottom: ${spacing.xl}px;
`

const Title = styled.Text`
  color: ${colors.surface};
  font-size: 28px;
  font-weight: 700;
`
