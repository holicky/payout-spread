import { useEffect, useRef } from 'react'
import {
  Animated,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

import { colors, radii } from '../theme'

type Props = {
  width?: DimensionValue
  height: number
  borderRadius?: number
  style?: StyleProp<ViewStyle>
}

export function Skeleton({
  width = '100%',
  height,
  borderRadius = radii.sm,
  style,
}: Props) {
  const opacity = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.borderSoft,
          opacity,
        },
        style,
      ]}
    />
  )
}
