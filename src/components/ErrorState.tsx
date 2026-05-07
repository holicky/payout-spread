import { Ionicons } from '@expo/vector-icons'
import styled from 'styled-components/native'

import { CnbFetchError } from '../api/cnb/client'
import { CnbParseError } from '../api/cnb/parser'
import { TEST_IDS } from '../lib/testIds'
import { colors, radii, spacing } from '../theme'
import { HapticPressable } from './HapticPressable'

type Props = {
  error: unknown
  onRetry: () => void
  isRetrying?: boolean
}

export function ErrorState({ error, onRetry, isRetrying }: Props) {
  const message = friendlyMessage(error)

  return (
    <Wrap>
      <IconWrap>
        <Ionicons
          name="cloud-offline-outline"
          size={28}
          color={colors.accent}
        />
      </IconWrap>
      <Title>Rates could not be loaded</Title>
      <Message>{message}</Message>
      <RetryButton
        testID={TEST_IDS.common.retryRates}
        onPress={onRetry}
        disabled={isRetrying}
        accessibilityLabel="Retry loading exchange rates"
        accessibilityState={{ disabled: !!isRetrying, busy: !!isRetrying }}
        haptic="light"
      >
        <Ionicons name="refresh" size={18} color={colors.surface} />
        <RetryText>{isRetrying ? 'Retrying...' : 'Retry'}</RetryText>
      </RetryButton>
    </Wrap>
  )
}

function friendlyMessage(error: unknown): string {
  if (error instanceof CnbParseError) {
    return 'The CNB response format changed or contained invalid data.'
  }

  if (error instanceof CnbFetchError) {
    return error.status
      ? `The CNB service returned HTTP ${error.status}.`
      : 'The CNB service did not respond.'
  }

  if (error instanceof Error) return error.message
  return 'Please check your connection and try again.'
}

const Wrap = styled.View`
  align-items: center;
  padding: 0 ${spacing.xl}px;
`

const IconWrap = styled.View`
  width: 56px;
  height: 56px;
  border-radius: ${radii.pill}px;
  background-color: ${colors.accentSoft};
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing.lg}px;
`

const Title = styled.Text`
  color: ${colors.text};
  font-size: 18px;
  font-weight: 700;
  text-align: center;
`

const Message = styled.Text`
  margin-top: ${spacing.sm}px;
  color: ${colors.textMuted};
  font-size: 14px;
  line-height: 20px;
  text-align: center;
`

const RetryButton = styled(HapticPressable)`
  margin-top: ${spacing.lg}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm}px;
  background-color: ${colors.accent};
  border-radius: ${radii.pill}px;
  padding: ${spacing.md}px ${spacing.lg}px;
  opacity: ${p => (p.disabled ? 0.7 : 1)};
`

const RetryText = styled.Text`
  color: ${colors.surface};
  font-size: 15px;
  font-weight: 600;
`
