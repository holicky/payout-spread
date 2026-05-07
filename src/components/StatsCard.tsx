import { Fragment } from 'react'
import styled from 'styled-components/native'

import { colors, radii, spacing } from '../theme'
import { StatRow, type StatTone } from './StatRow'

export type StatItem = {
  label: string
  value: string
  tone?: StatTone
}

export function StatsCard({ items }: { items: StatItem[] }) {
  return (
    <Card>
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && <Divider />}
          <StatRow label={item.label} value={item.value} tone={item.tone} />
        </Fragment>
      ))}
    </Card>
  )
}

const Card = styled.View`
  background-color: ${colors.surface};
  border-radius: ${radii.md}px;
  padding: ${spacing.xs}px ${spacing.lg}px;
`

const Divider = styled.View`
  height: 1px;
  background-color: ${colors.borderSoft};
`
