import * as Haptics from 'expo-haptics'
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

type HapticType =
  | 'selection'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'none'

export type HapticPressableProps = Omit<PressableProps, 'style' | 'onPress'> & {
  onPress: () => void
  style?: StyleProp<ViewStyle>
  pressedOpacity?: number
  haptic?: HapticType
}

export function HapticPressable({
  onPress,
  style,
  pressedOpacity = 0.6,
  haptic = 'selection',
  accessibilityRole = 'button',
  children,
  ...rest
}: HapticPressableProps) {
  return (
    <Pressable
      {...rest}
      accessibilityRole={accessibilityRole}
      onPress={() => {
        onPress()
        runHaptic(haptic)
      }}
      style={({ pressed }) => [style, pressed && { opacity: pressedOpacity }]}
    >
      {children}
    </Pressable>
  )
}

function runHaptic(type: HapticType) {
  if (type === 'none') return
  try {
    switch (type) {
      case 'selection':
        Haptics.selectionAsync()
        return
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        return
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        return
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        return
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        return
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        return
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        return
    }
  } catch {
    // expo-haptics may not be linked in the running runtime; ignore.
  }
}
