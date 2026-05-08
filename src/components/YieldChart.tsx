import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated } from 'react-native'
import { LineChart } from 'react-native-gifted-charts'
import Svg, { Line } from 'react-native-svg'
import styled from 'styled-components/native'

import { formatNumber } from '../lib/format'
import { niceStep } from '../lib/nice-step'
import type { ChartPoint } from '../lib/series'
import { colors, radii, spacing } from '../theme'
import { Skeleton } from './Skeleton'

type Props = {
  data: ChartPoint[]
  width: number
  height?: number
  unit?: string
  isLoading?: boolean
}

type Focused = { value: number; date: string }
type PointerLabelItem = { value?: number; date?: string; label?: string }

const SECTIONS = 5
const HEADER_HEIGHT = 56

export const YieldChart = memo(function YieldChart({
  data,
  width,
  height = 180,
  unit,
  isLoading,
}: Props) {
  const { values, dataMin, dataMax, yMin, yMax, hasRange } = useMemo(() => {
    const numericValues = data
      .map(point => point.value)
      .filter(value => Number.isFinite(value) && value > 0)
    const inRange = numericValues.length >= 2
    const min = inRange ? Math.min(...numericValues) : 0
    const max = inRange ? Math.max(...numericValues) : 1
    const range = max - min || max || 1
    const step = niceStep(range / SECTIONS || 1)
    return {
      values: numericValues,
      dataMin: min,
      dataMax: max,
      hasRange: inRange,
      yMin: Math.max(0, Math.floor((min - range * 0.1) / step) * step),
      yMax: Math.ceil((max + range * 0.1) / step) * step,
    }
  }, [data])

  const chartData = useMemo(
    () =>
      data.map(point => ({
        value: point.value,
        label: '',
        date: point.label,
      })),
    [data],
  )

  const opacity = useRef(new Animated.Value(1)).current
  // Stable signature so the fade only re-fires when the visible range changes,
  // not on every refetch that hands us a fresh array reference.
  const dataKey = `${data.length}|${data[0]?.label ?? ''}|${data[data.length - 1]?.label ?? ''}`
  useEffect(() => {
    opacity.setValue(0)
    Animated.timing(opacity, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start()
  }, [dataKey, opacity])

  const [focused, setFocused] = useState<Focused | null>(null)
  const touching = useRef(false)
  const handlePointerLabel = useCallback((items?: PointerLabelItem[]) => {
    const item = items?.[0]
    if (typeof item?.value === 'number') {
      // Deferred because gifted-charts invokes this during render. Gated by
      // `touching` so late callbacks fired after touchend can't re-focus.
      setTimeout(() => {
        if (!touching.current) return
        setFocused({
          value: item.value!,
          date: item.date ?? item.label ?? '',
        })
      }, 0)
    }
    return null
  }, [])
  const handleTouchStart = useCallback(() => {
    touching.current = true
  }, [])
  const handleTouchEnd = useCallback(() => {
    touching.current = false
    setFocused(null)
  }, [])

  const latestValue = values.at(-1) ?? 0
  const latestDate = data.length ? (data[data.length - 1]!.label ?? '') : ''
  const display: Focused = focused ?? { value: latestValue, date: latestDate }

  const totalYRange = yMax - yMin || 1
  const maxOffsetTop = ((yMax - dataMax) / totalYRange) * height
  const minOffsetBottom = ((dataMin - yMin) / totalYRange) * height

  const chartWidth = width - 80

  return (
    <Card>
      <Viewport
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <Header pointerEvents="none">
          <HeaderValue>
            {formatNumber(display.value)}
            {unit ? ` ${unit}` : ''}
          </HeaderValue>
          <HeaderDate>{display.date}</HeaderDate>
        </Header>

        <ChartArea>
          {isLoading ? (
            <Skeleton width="100%" height={height} borderRadius={radii.sm} />
          ) : (
            <>
              <Animated.View style={{ opacity }}>
                <LineChart
                  data={chartData}
                  width={chartWidth}
                  height={height}
                  thickness={2}
                  color={colors.accent}
                  curved
                  hideAxesAndRules
                  hideYAxisText
                  hideDataPoints
                  yAxisLabelWidth={0}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  xAxisLabelTextStyle={{ height: 0, fontSize: 0 }}
                  initialSpacing={8}
                  endSpacing={32}
                  maxValue={yMax - yMin}
                  yAxisOffset={yMin}
                  xAxisLabelsHeight={0}
                  adjustToWidth
                  pointerConfig={{
                    pointerStripUptoDataPoint: true,
                    pointerStripColor: 'transparent',
                    pointerStripWidth: 0,
                    pointerColor: colors.accent,
                    radius: 5,
                    pointerLabelWidth: 0,
                    pointerLabelHeight: 0,
                    autoAdjustPointerLabelPosition: false,
                    persistPointer: false,
                    pointerLabelComponent: handlePointerLabel,
                  }}
                />
              </Animated.View>

              {hasRange ? (
                <>
                  <DottedLineWrap
                    style={{ bottom: minOffsetBottom }}
                    pointerEvents="none"
                  >
                    <Svg width={chartWidth} height={1}>
                      <Line
                        x1={0}
                        y1={0.5}
                        x2={chartWidth}
                        y2={0.5}
                        stroke={colors.border}
                        strokeWidth={1}
                        strokeDasharray="2,4"
                      />
                    </Svg>
                  </DottedLineWrap>
                  <MaxLabel style={{ top: Math.max(0, maxOffsetTop - 7) }}>
                    {formatNumber(dataMax)}
                  </MaxLabel>
                  <MinLabel
                    style={{ bottom: Math.max(0, minOffsetBottom - 7) }}
                  >
                    {formatNumber(dataMin)}
                  </MinLabel>
                </>
              ) : null}
            </>
          )}
        </ChartArea>
      </Viewport>
    </Card>
  )
})

const Card = styled.View`
  background-color: ${colors.surface};
  border-radius: ${radii.md}px;
  padding: ${spacing.lg}px ${spacing.sm}px ${spacing.sm}px;
`

const Viewport = styled.View`
  position: relative;
`

const Header = styled.View`
  height: ${HEADER_HEIGHT}px;
  padding-left: 4px;
  justify-content: flex-start;
`

const HeaderValue = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.text};
  font-variant: tabular-nums;
`

const HeaderDate = styled.Text`
  margin-top: 4px;
  font-size: 12px;
  color: ${colors.textMuted};
`

const ChartArea = styled.View`
  position: relative;
`

const MaxLabel = styled.Text`
  position: absolute;
  right: 4px;
  font-size: 11px;
  color: ${colors.textSubtle};
  font-variant: tabular-nums;
`

const MinLabel = styled(MaxLabel)``

const DottedLineWrap = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
`
