import { Ionicons } from '@expo/vector-icons'
import { memo } from 'react'
import styled from 'styled-components/native'

import { colors, radii, spacing } from '../theme'

type Confidence = 'low' | 'medium' | 'high'

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name']
  headline: string
  detail: string
  confidence?: Confidence
}

export const InsightCard = memo(function InsightCard({
  icon,
  headline,
  detail,
  confidence,
}: Props) {
  return (
    <Card>
      <IconWrap>
        <Ionicons name={icon} size={20} color={colors.accent} />
      </IconWrap>
      <Body>
        <Headline>{headline}</Headline>
        <Detail>{detail}</Detail>
        {confidence ? (
          <ConfidencePill $tone={confidence}>
            <ConfidenceText $tone={confidence}>
              {confidenceLabel(confidence)}
            </ConfidenceText>
          </ConfidencePill>
        ) : null}
      </Body>
    </Card>
  )
})

function confidenceLabel(c: Confidence): string {
  return c === 'high'
    ? 'High confidence'
    : c === 'medium'
      ? 'Medium confidence'
      : 'Low confidence'
}

const Card = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: ${spacing.md}px;
  background-color: ${colors.surface};
  border-radius: ${radii.md}px;
  padding: ${spacing.md}px ${spacing.lg}px;
`

const IconWrap = styled.View`
  width: 36px;
  height: 36px;
  border-radius: ${radii.pill}px;
  background-color: ${colors.accentSoft};
  align-items: center;
  justify-content: center;
  margin-top: 2px;
`

const Body = styled.View`
  flex: 1;
`

const Headline = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.text};
`

const Detail = styled.Text`
  margin-top: 4px;
  font-size: 12px;
  color: ${colors.textMuted};
  font-variant: tabular-nums;
`

const ConfidencePill = styled.View<{ $tone: Confidence }>`
  align-self: flex-start;
  margin-top: 8px;
  padding: 2px 8px;
  border-radius: ${radii.pill}px;
  background-color: ${p =>
    p.$tone === 'high'
      ? '#dcfce7'
      : p.$tone === 'medium'
        ? '#fef3c7'
        : '#fee2e2'};
`

const ConfidenceText = styled.Text<{ $tone: Confidence }>`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${p =>
    p.$tone === 'high'
      ? '#166534'
      : p.$tone === 'medium'
        ? '#92400e'
        : '#991b1b'};
`
