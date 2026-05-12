import { useIsFocused } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import {
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  type FlatListProps,
  type RefreshControlProps,
  type ViewStyle,
} from 'react-native'
import styled from 'styled-components/native'

import { colors } from '../theme'

const isIOS = Platform.OS === 'ios'

type HeaderOffset = {
  headerHeight: number
  baseContentStyle?: ViewStyle
}

const headerScrollAttrs = ({ headerHeight, baseContentStyle }: HeaderOffset) =>
  isIOS
    ? {
        contentContainerStyle: { ...baseContentStyle },
        contentInset: { top: headerHeight },
        contentOffset: { x: 0, y: -headerHeight },
        scrollIndicatorInsets: { top: headerHeight },
      }
    : {
        contentContainerStyle: { ...baseContentStyle, marginTop: headerHeight },
      }

export const PullScroll = styled(ScrollView).attrs<HeaderOffset>(
  headerScrollAttrs,
)`
  flex: 1;
`

export function PullList<T>(props: FlatListProps<T> & HeaderOffset) {
  const { headerHeight, baseContentStyle, ...rest } = props
  return (
    <FlatList<T>
      {...headerScrollAttrs({ headerHeight, baseContentStyle })}
      {...rest}
    />
  )
}

// Forces the RefreshControl to remount the first time the screen becomes
// focused. Works around an iOS quirk where `tintColor` set on the native
// UIRefreshControl is silently ignored when the hosting UIScrollView mounts
// off-screen (every tab except the initially focused one).
export function useFocusedKey() {
  const isFocused = useIsFocused()
  const [seenFocus, setSeenFocus] = useState(isFocused)
  useEffect(() => {
    if (isFocused) setSeenFocus(true)
  }, [isFocused])
  return seenFocus ? 'focused' : 'pending'
}

type PullRefreshControlProps = RefreshControlProps & {
  headerHeight: number
  refreshKey?: string
}

export function pullRefreshControl({
  headerHeight,
  refreshKey,
  ...rest
}: PullRefreshControlProps) {
  return (
    <RefreshControl
      key={refreshKey}
      {...rest}
      tintColor="#FFFFFF"
      colors={[colors.accent]}
      progressViewOffset={isIOS ? 0 : headerHeight}
    />
  )
}
