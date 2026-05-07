import type { ReactNode } from 'react'
import styled from 'styled-components/native'

import { colors, radii } from '../theme'

type Props = {
  children: ReactNode
  testID?: string
}

export function Screen({ children, testID }: Props) {
  return (
    <Backdrop testID={testID}>
      <Content>{children}</Content>
    </Backdrop>
  )
}

const Backdrop = styled.View`
  flex: 1;
  background-color: ${colors.accentDeep};
`

const Content = styled.View`
  flex: 1;
  background-color: ${colors.surfaceMuted};
  border-top-left-radius: ${radii.lg + 10}px;
  border-top-right-radius: ${radii.lg + 10}px;
`
