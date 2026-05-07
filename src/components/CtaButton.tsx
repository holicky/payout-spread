import { Ionicons } from '@expo/vector-icons'
import styled from 'styled-components/native'

import { colors, radii, spacing } from '../theme'
import { HapticPressable } from './HapticPressable'

type Props = {
  label: string
  onPress: () => void
  icon?: React.ComponentProps<typeof Ionicons>['name']
  testID?: string
}

export function CtaButton({
  label,
  onPress,
  icon = 'arrow-forward',
  testID,
}: Props) {
  return (
    <Button
      testID={testID}
      onPress={onPress}
      accessibilityLabel={label}
      haptic="light"
    >
      <Label>{label}</Label>
      <Ionicons name={icon} size={18} color={colors.surface} />
    </Button>
  )
}

const Button = styled(HapticPressable)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm}px;
  background-color: ${colors.accent};
  border-radius: ${radii.pill}px;
  padding: 14px ${spacing.lg}px;
`

const Label = styled.Text`
  color: ${colors.surface};
  font-size: 15px;
  font-weight: 600;
`
