import { Feather } from '@expo/vector-icons'
import { useMemo, useRef, useState } from 'react'
import { Modal, SectionList } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import type { CurrencyRate } from '../../api/cnb/types'
import { HapticPressable } from '../HapticPressable'
import { nameFor } from '../../lib/currency-names'
import { buildSections } from '../../lib/picker-sections'
import { TEST_IDS } from '../../lib/testIds'
import { colors, radii, spacing, touch } from '../../theme'
import { CurrencyFlag } from './CurrencyFlag'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function CurrencyPickerModal({
  open,
  rates,
  selected,
  onClose,
  onPick,
}: {
  open: boolean
  rates: CurrencyRate[]
  selected: string
  onClose: () => void
  onPick: (code: string) => void
}) {
  const [query, setQuery] = useState('')
  const listRef = useRef<SectionList<CurrencyRate, { letter: string }>>(null)

  const sections = useMemo(() => buildSections(rates, query), [rates, query])
  const lettersWithData = useMemo(
    () => new Set(sections.map(section => section.letter)),
    [sections],
  )

  function jumpTo(letter: string) {
    const sectionIndex = sections.findIndex(
      section => section.letter === letter,
    )
    if (sectionIndex < 0) return
    listRef.current?.scrollToLocation({
      sectionIndex,
      itemIndex: 0,
      animated: false,
      viewOffset: 0,
    })
  }

  return (
    <Modal
      testID={TEST_IDS.picker.modal}
      visible={open}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      onDismiss={() => setQuery('')}
    >
      <SafeAreaProvider>
        <Safe edges={['top', 'bottom']}>
          <Header>
            <TopBar>
              <HapticPressable
                testID={TEST_IDS.picker.close}
                onPress={onClose}
                hitSlop={12}
                accessibilityLabel="Close"
                haptic="light"
              >
                <CloseIcon>✕</CloseIcon>
              </HapticPressable>
            </TopBar>
            <Title>Select currency</Title>
            <SearchWrap>
              <Feather name="search" size={20} color={colors.textSubtle} />
              <SearchInput
                testID={TEST_IDS.picker.search}
                value={query}
                onChangeText={setQuery}
                placeholder="Search"
                placeholderTextColor={colors.textSubtle}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                accessibilityLabel="Search currencies"
              />
            </SearchWrap>
          </Header>

          <Body>
            <SectionList
              testID={TEST_IDS.picker.list}
              ref={listRef}
              sections={sections}
              keyExtractor={rate => rate.code}
              initialNumToRender={16}
              maxToRenderPerBatch={16}
              windowSize={7}
              stickySectionHeadersEnabled={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Empty>No matches</Empty>}
              renderSectionHeader={({ section }) => (
                <SectionHeader>{section.letter}</SectionHeader>
              )}
              renderItem={({ item }) => (
                <Row
                  testID={TEST_IDS.picker.row(item.code)}
                  onPress={() => onPick(item.code)}
                  accessibilityState={{ selected: item.code === selected }}
                  accessibilityLabel={`${nameFor(item.code, item.currencyName)}, ${item.code}${
                    item.code === selected ? ', selected' : ''
                  }`}
                >
                  <CurrencyFlag code={item.code} size={36} />
                  <RowText>
                    {nameFor(item.code, item.currencyName)}
                    <Dash>{'  -  '}</Dash>
                    <RowCode>{item.code}</RowCode>
                  </RowText>
                  {item.code === selected && <Check>✓</Check>}
                </Row>
              )}
            />

            <Index>
              {ALPHABET.map(letter => {
                const enabled = lettersWithData.has(letter)
                return (
                  <HapticPressable
                    key={letter}
                    disabled={!enabled}
                    testID={TEST_IDS.picker.indexLetter(letter)}
                    onPress={() => jumpTo(letter)}
                    hitSlop={4}
                    haptic="none"
                    accessibilityState={{ disabled: !enabled }}
                    accessibilityLabel={`Jump to ${letter}`}
                  >
                    <IndexLetter $enabled={enabled}>{letter}</IndexLetter>
                  </HapticPressable>
                )
              })}
            </Index>
          </Body>
        </Safe>
      </SafeAreaProvider>
    </Modal>
  )
}

const Safe = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.surface};
`

const Header = styled.View`
  padding: ${spacing.sm}px ${spacing.lg}px ${spacing.md}px;
`

const TopBar = styled.View`
  flex-direction: row;
  justify-content: flex-end;
`

const CloseIcon = styled.Text`
  font-size: 22px;
  color: ${colors.text};
  min-width: ${touch.minTarget}px;
  min-height: ${touch.minTarget}px;
  text-align: center;
  line-height: ${touch.minTarget}px;
`

const Title = styled.Text`
  font-size: 28px;
  font-weight: 700;
  color: ${colors.text};
  margin-top: ${spacing.lg}px;
  margin-bottom: ${spacing.lg}px;
`

const SearchWrap = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${colors.borderSoft};
  border-radius: ${radii.md}px;
  padding: 0 ${spacing.md}px;
  height: 44px;
  gap: ${spacing.sm}px;
`

const SearchInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: ${colors.text};
`

const Body = styled.View`
  flex: 1;
  flex-direction: row;
`

const SectionHeader = styled.Text`
  padding: ${spacing.lg}px ${spacing.lg}px 6px;
  font-size: 14px;
  font-weight: 700;
  color: ${colors.text};
`

const Row = styled(HapticPressable)`
  flex-direction: row;
  align-items: center;
  padding: ${spacing.md}px ${spacing.lg}px;
  gap: 14px;
`

const RowText = styled.Text`
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: ${colors.text};
`

const Dash = styled.Text`
  color: ${colors.textSubtle};
  font-weight: 400;
`

const RowCode = styled.Text`
  color: ${colors.text};
  font-weight: 600;
`

const Check = styled.Text`
  font-size: 18px;
  color: ${colors.accent};
  font-weight: 700;
`

const Empty = styled.Text`
  padding: 32px ${spacing.lg}px;
  text-align: center;
  color: ${colors.textSubtle};
`

const Index = styled.View`
  padding: ${spacing.sm}px 6px;
  align-items: center;
  justify-content: center;
`

const IndexLetter = styled.Text<{ $enabled: boolean }>`
  font-size: 11px;
  line-height: 14px;
  color: ${p => (p.$enabled ? colors.accent : '#d1d5db')};
  font-weight: 600;
`
