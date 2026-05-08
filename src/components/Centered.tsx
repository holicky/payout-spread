import type { ReactNode } from 'react'
import styled from 'styled-components/native'

import { colors, radii } from '../theme'
import { useHeaderHeight } from './Screen'

export function Centered({ children }: { children: ReactNode }) {
  const headerHeight = useHeaderHeight()
  return <Wrap style={{ marginTop: headerHeight }}>{children}</Wrap>
}

const Wrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${colors.surfaceMuted};
  border-top-left-radius: ${radii.lg + 10}px;
  border-top-right-radius: ${radii.lg + 10}px;
`
