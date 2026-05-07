import React from 'react'
import type { ReactElement } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { TEST_IDS } from '../lib/testIds'
import { useConversionStore } from '../state/conversion'
import { ConversionForm } from './ConversionForm'

type TestNode = {
  children: Array<TestNode | string>
}

type TestRendererRoot = {
  findByProps: (props: Record<string, unknown>) => TestNode
}

type TestRendererInstance = {
  root: TestRendererRoot
}

type TestRendererApi = {
  act: (callback: () => void) => void
  create: (element: ReactElement) => TestRendererInstance
}

const TestRenderer = require('react-test-renderer') as TestRendererApi

jest.mock('@expo/vector-icons', () => {
  const React = require('react')
  const { Text } = require('react-native')
  const Icon = ({ name }: { name: string }) =>
    React.createElement(Text, null, name)
  return { Ionicons: Icon, Feather: Icon }
})

jest.mock('../api/cnb/useDailyRates', () => ({
  useDailyRates: () => ({
    data: {
      date: '2026-05-06',
      sequenceNumber: 86,
      rates: [
        {
          country: 'USA',
          currencyName: 'dollar',
          amount: 1,
          code: 'USD',
          rate: 20,
        },
      ],
    },
  }),
}))

describe('ConversionForm', () => {
  beforeEach(() => {
    useConversionStore.setState({
      amount: '100',
      sourceCode: 'CZK',
      targetCode: 'USD',
    })
  })

  it('renders the default CZK to USD conversion from mocked CNB rates', () => {
    let renderer: TestRendererInstance | undefined
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 0, right: 0, bottom: 0, left: 0 },
          }}
        >
          <ConversionForm />
        </SafeAreaProvider>,
      )
    })

    expect(renderer).toBeDefined()

    const sourceCurrency = renderer!.root.findByProps({
      testID: TEST_IDS.converter.sourceCurrency,
    })
    const sourceAmount = renderer!.root.findByProps({
      testID: TEST_IDS.converter.sourceAmount,
    })
    const targetCurrency = renderer!.root.findByProps({
      testID: TEST_IDS.converter.targetCurrency,
    })
    const targetAmount = renderer!.root.findByProps({
      testID: TEST_IDS.converter.targetAmount,
    })

    expect(textOf(sourceCurrency)).toContain('CZK')
    expect(textOf(sourceAmount)).toContain('100')
    expect(textOf(targetCurrency)).toContain('USD')
    expect(textOf(targetAmount)).toContain('5')
    expect(textOf(targetAmount)).toContain('1 CZK = 0.0500 USD')
  })
})

function textOf(node: TestNode): string {
  return node.children
    .map(child => (typeof child === 'string' ? child : textOf(child)))
    .join('')
}
