import type { ReactNode } from 'react'
import styled from 'styled-components/native'

import { colors } from '../theme'

export function Centered({ children }: { children: ReactNode }) {
  return <Wrap>{children}</Wrap>
}

const Wrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${colors.surfaceMuted};
`
