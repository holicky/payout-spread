import React, { useEffect, useRef } from 'react'
import { Animated, ViewStyle, StyleProp } from 'react-native'

interface StaggerFadeInProps {
  index: number
  delay?: number
  duration?: number
  translateY?: number
  style?: StyleProp<ViewStyle>
  children: React.ReactNode
}

export const StaggerFadeIn: React.FC<StaggerFadeInProps> = ({
  index,
  delay = 50,
  duration = 300,
  translateY = 10,
  style,
  children,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateAnim = useRef(new Animated.Value(translateY)).current

  useEffect(() => {
    const staggerDelay = index * delay
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay: staggerDelay,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration,
        delay: staggerDelay,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View
      style={[
        { opacity: fadeAnim, transform: [{ translateY: translateAnim }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  )
}
