import styled from 'styled-components/native'

import { TEST_IDS } from '../lib/testIds'
import { colors, radii, spacing } from '../theme'
import { HapticPressable } from './HapticPressable'

export const PERIODS = [
  { label: '1W', days: 7 },
  { label: '1M', days: 22 },
  { label: '3M', days: 60 },
  { label: '6M', days: 90 },
] as const

type Props = {
  selected: number
  onChange: (days: number) => void
}

export function PeriodSelector({ selected, onChange }: Props) {
  return (
    <Track>
      {PERIODS.map(p => (
        <Chip
          key={p.days}
          testID={TEST_IDS.common.period(p.label)}
          $active={p.days === selected}
          onPress={() => onChange(p.days)}
          accessibilityLabel={`Show ${p.label} period`}
          accessibilityState={{ selected: p.days === selected }}
          haptic="selection"
        >
          <ChipText $active={p.days === selected}>{p.label}</ChipText>
        </Chip>
      ))}
    </Track>
  )
}

const Track = styled.View`
  flex-direction: row;
  background-color: ${colors.surface};
  border-radius: ${radii.pill}px;
  padding: ${spacing.xs}px;
`

const Chip = styled(HapticPressable)<{ $active: boolean }>`
  flex: 1;
  padding: ${spacing.sm}px 0;
  border-radius: ${radii.pill}px;
  background-color: ${p => (p.$active ? colors.accent : 'transparent')};
  align-items: center;
`

const ChipText = styled.Text<{ $active: boolean }>`
  color: ${p => (p.$active ? colors.surface : colors.textMuted)};
  font-size: 13px;
  font-weight: 600;
`
