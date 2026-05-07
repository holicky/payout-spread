import { Ionicons } from '@expo/vector-icons'
import styled from 'styled-components/native'

import { colors, radii, spacing } from '../theme'

type Props = {
  children: React.ReactNode
}

export function Disclaimer({ children }: Props) {
  return (
    <Wrap>
      <Ionicons
        name="information-circle-outline"
        size={16}
        color={colors.textMuted}
        style={{ marginTop: 1 }}
      />
      <Text>{children}</Text>
    </Wrap>
  )
}

const Wrap = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: ${spacing.sm}px;
  background-color: ${colors.borderSoft};
  border-radius: ${radii.sm}px;
  padding: ${spacing.md}px ${spacing.md}px ${spacing.md}px ${spacing.md}px;
`

const Text = styled.Text`
  flex: 1;
  font-size: 11px;
  line-height: 16px;
  color: ${colors.textMuted};
  font-style: italic;
`
