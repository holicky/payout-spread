import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { TEST_IDS } from '../lib/testIds'
import { ConverterScreen } from '../screens/ConverterScreen'
import { TimingScreen } from '../screens/TimingScreen'
import { TodayScreen } from '../screens/TodayScreen'
import { colors, topEdgeShadow } from '../theme'

export type RootTabParamList = {
  Today: undefined
  Converter: undefined
  Timing: undefined
}

const Tab = createBottomTabNavigator<RootTabParamList>()

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const tabIcon =
  (filled: IoniconName, outline: IoniconName) =>
  ({
    focused,
    color,
    size,
  }: {
    focused: boolean
    color: string
    size: number
  }) => <Ionicons name={focused ? filled : outline} size={size} color={color} />

export function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopWidth: 0,
          ...topEdgeShadow,
        },
      }}
    >
      <Tab.Screen
        name="Converter"
        component={ConverterScreen}
        options={{
          title: 'Converter',
          tabBarIcon: tabIcon('swap-horizontal', 'swap-horizontal-outline'),
          tabBarButtonTestID: TEST_IDS.tab.converter,
        }}
      />
      <Tab.Screen
        name="Timing"
        component={TimingScreen}
        options={{
          title: 'Conversion Timing',
          tabBarIcon: tabIcon('time', 'time-outline'),
          tabBarButtonTestID: TEST_IDS.tab.timing,
        }}
      />
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          title: "Today's Rates",
          tabBarIcon: tabIcon('today', 'today-outline'),
          tabBarButtonTestID: TEST_IDS.tab.today,
        }}
      />
    </Tab.Navigator>
  )
}
