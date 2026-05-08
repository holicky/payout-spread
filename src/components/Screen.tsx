import { createContext, useContext, useState, type ReactNode } from 'react'
import { useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import { colors } from '../theme'
import { ScreenHeader } from './ScreenHeader'

const HeaderHeightContext = createContext(0)

export function useHeaderHeight() {
  return useContext(HeaderHeightContext)
}

type Props = {
  children: ReactNode
  title: string
  testID?: string
}

export function Screen({ children, title, testID }: Props) {
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()
  // Estimated until onLayout reports the real height — keeps first paint stable.
  const [titleHeight, setTitleHeight] = useState(insets.top + 84)
  return (
    <Backdrop testID={testID}>
      <HeaderLayer>
        <View onLayout={e => setTitleHeight(e.nativeEvent.layout.height)}>
          <ScreenHeader title={title} />
        </View>
        <HeaderOverlap style={{ height: windowHeight * 0.5 }} />
      </HeaderLayer>
      <HeaderHeightContext.Provider value={titleHeight}>
        {children}
      </HeaderHeightContext.Provider>
    </Backdrop>
  )
}

const Backdrop = styled.View`
  flex: 1;
  background-color: ${colors.surfaceMuted};
`

const HeaderLayer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`

const HeaderOverlap = styled.View`
  background-color: ${colors.accent};
`
