import { Image } from 'expo-image'
import styled from 'styled-components/native'

import { flagUrlFor } from '../../lib/flags'

export function CurrencyFlag({
  code,
  size = 36,
}: {
  code: string
  size?: number
}) {
  const flagUri = flagUrlFor(code)
  return (
    <Circle
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      {flagUri ? (
        <Image
          accessible={false}
          source={flagUri}
          style={{ width: size, height: size }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={120}
        />
      ) : (
        <Fallback style={{ fontSize: size * 0.6, lineHeight: size }}>
          🏳️
        </Fallback>
      )}
    </Circle>
  )
}

const Circle = styled.View`
  background-color: #f3f4f6;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`

const Fallback = styled.Text`
  text-align: center;
`
