import { Ionicons } from '@expo/vector-icons'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Animated, AppState, Easing } from 'react-native'
import styled from 'styled-components/native'

import { formatLongDate } from '../lib/format'
import { colors, spacing, touch } from '../theme'
import { HapticPressable } from './HapticPressable'

type Props = {
  date: string
  updatedAt?: number
  onRefresh?: () => void
  isRefreshing?: boolean
  detail?: string
  testID?: string
}

export function LastUpdated({
  date,
  updatedAt,
  onRefresh,
  isRefreshing,
  detail,
  testID,
}: Props) {
  const [, setNow] = useState(() => Date.now())
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null
    const start = () => {
      if (id != null) return
      setNow(Date.now())
      id = setInterval(() => setNow(Date.now()), 30_000)
    }
    const stop = () => {
      if (id != null) {
        clearInterval(id)
        id = null
      }
    }
    if (AppState.currentState === 'active') start()
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') start()
      else stop()
    })
    return () => {
      stop()
      sub.remove()
    }
  }, [])

  const label =
    updatedAt != null
      ? `Updated ${relativeTime(Date.now() - updatedAt)}${isRefreshing ? ' · refreshing' : ''}`
      : `Last updated: ${formatLongDate(date)}`

  return (
    <Wrap>
      <TextCol>
        <Line>{label}</Line>
        {detail ? <Detail>{detail}</Detail> : null}
      </TextCol>
      {onRefresh ? (
        <RefreshButton
          testID={testID}
          onPress={onRefresh}
          accessibilityLabel="Refresh rates"
          accessibilityState={{ busy: !!isRefreshing }}
          haptic="light"
        >
          <Spinner spinning={!!isRefreshing}>
            <Ionicons name="refresh" size={16} color={colors.accent} />
          </Spinner>
        </RefreshButton>
      ) : null}
    </Wrap>
  )
}

function relativeTime(diffMs: number): string {
  const sec = Math.max(0, Math.floor(diffMs / 1000))
  if (sec < 30) return 'just now'
  if (sec < 60) return 'less than a minute ago'
  const min = Math.floor(sec / 60)
  if (min === 1) return '1 minute ago'
  if (min < 60) return `${min} minutes ago`
  const hour = Math.floor(min / 60)
  if (hour === 1) return '1 hour ago'
  if (hour < 24) return `${hour} hours ago`
  const day = Math.floor(hour / 24)
  if (day === 1) return 'yesterday'
  return `${day} days ago`
}

function Spinner({
  spinning,
  children,
}: {
  spinning: boolean
  children: ReactNode
}) {
  const rot = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (!spinning) {
      rot.setValue(0)
      return
    }
    const loop = Animated.loop(
      Animated.timing(rot, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )
    loop.start()
    return () => loop.stop()
  }, [spinning, rot])

  const spin = rot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })
  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      {children}
    </Animated.View>
  )
}

const Wrap = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${spacing.md}px;
`

const TextCol = styled.View`
  flex: 1;
`

const Line = styled.Text`
  color: ${colors.textMuted};
  font-size: 13px;
`

const Detail = styled.Text`
  color: ${colors.textSubtle};
  font-size: 12px;
  margin-top: 2px;
`

const RefreshButton = styled(HapticPressable)`
  min-width: ${touch.minTarget}px;
  min-height: ${touch.minTarget}px;
  align-items: center;
  justify-content: center;
`
