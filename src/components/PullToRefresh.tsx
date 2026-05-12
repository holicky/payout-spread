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

type PullRefreshControlProps = RefreshControlProps & { headerHeight: number }

export function pullRefreshControl({
  headerHeight,
  ...rest
}: PullRefreshControlProps) {
  return (
    <RefreshControl
      {...rest}
      tintColor={colors.surface}
      colors={[colors.accent]}
      progressViewOffset={isIOS ? 0 : headerHeight}
    />
  )
}
