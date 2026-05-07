import styled from 'styled-components/native'

import { colors, spacing } from '../theme'

export type StatTone = 'positive' | 'negative'

type Props = {
  label: string
  value: string
  tone?: StatTone
}

export function StatRow({ label, value, tone }: Props) {
  return (
    <Row>
      <Label>{label}</Label>
      <Value $tone={tone}>{value}</Value>
    </Row>
  )
}

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.md}px 0;
`

const Label = styled.Text`
  color: ${colors.textMuted};
  font-size: 14px;
`

const Value = styled.Text<{ $tone?: StatTone }>`
  font-variant: tabular-nums;
  font-weight: 600;
  color: ${p =>
    p.$tone === 'positive'
      ? colors.positive
      : p.$tone === 'negative'
        ? colors.negative
        : colors.text};
`
