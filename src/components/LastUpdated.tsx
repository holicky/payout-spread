import { memo, useEffect, useState } from 'react'
import { AppState } from 'react-native'
import styled from 'styled-components/native'

import { formatLongDate } from '../lib/format'
import { relativeTime } from '../lib/relative-time'
import { colors, spacing } from '../theme'

type Props = {
  date: string
  updatedAt?: number
  detail?: string
}

export const LastUpdated = memo(function LastUpdated({
  date,
  updatedAt,
  detail,
}: Props) {
  const [, setNow] = useState(() => Date.now())
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null
    const start = () => {
      if (id != null) return
      setNow(Date.now())
      id = setInterval(() => setNow(Date.now()), 30_000)
    }
    const stop = () => {
      if (id != null) {
        clearInterval(id)
        id = null
      }
    }
    if (AppState.currentState === 'active') start()
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') start()
      else stop()
    })
    return () => {
      stop()
      sub.remove()
    }
  }, [])

  const label =
    updatedAt != null
      ? `Updated ${relativeTime(Date.now() - updatedAt)}`
      : `Last updated: ${formatLongDate(date)}`

  return (
    <Wrap>
      <Line>{label}</Line>
      {detail ? <Detail>{detail}</Detail> : null}
    </Wrap>
  )
})

const Wrap = styled.View`
  margin-bottom: ${spacing.md}px;
`

const Line = styled.Text`
  color: ${colors.textMuted};
  font-size: 13px;
`

const Detail = styled.Text`
  color: ${colors.textSubtle};
  font-size: 12px;
  margin-top: 6px;
`
