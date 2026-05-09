# Payout Spread

A small React Native app that turns the Czech National Bank's daily fixings into something useful: live CZK exchange rates, a CZK ⇄ foreign-currency converter, and a "best day to convert" view that shows how recent rate movements would have changed your payout.

Built with Expo SDK 54, React Native 0.81 and React 19.

> **For reviewers:** see [SUBMISSION.md](./SUBMISSION.md) for the requirements checklist, decision log, and notes on how I approached the brief.

## Screenshots

**Today**

<img src="./assets/screenshots/rates.png" alt="Today screen" width="320" />

**Converter**

<img src="./assets/screenshots/converter.png" alt="Converter screen" width="320" />

**Conversion Timing**

<img src="./assets/screenshots/timing.png" alt="Timing screen" width="320" />

## Features

- **Today** — pull-to-refresh list of CNB fixings for the current business day. Pick any currency (including CZK) as the reference and every other rate restates against it.
- **Converter** — calculator-style amount entry with a currency picker on each side. Defaults to the assignment's CZK → foreign flow but works in either direction. Recent conversions are kept locally for quick reuse. Below the form, a yield chart shows how the same conversion would have performed over selectable windows (1W / 1M / 3M / 6M) with period high/low/change stats.
- **Conversion Timing** — bonus tab. Over the last business year of CNB fixings, finds the weekday that delivered the best rate in the most weeks and the part of month (early / mid / late) that won the most months. A confidence label (high / medium / low) tells you whether the pattern actually beats chance — for major liquid CZK pairs it'll usually say "low", which is the honest answer.
- **Offline-friendly** — React Query state is persisted to AsyncStorage so the last-known rates are available immediately on cold start.
- **Native feel** — haptic feedback on key actions, safe-area aware layout, edge-to-edge on Android, light theme tuned for legibility.

## Getting started

Requires **Node 22** (see `.nvmrc`) and Yarn.

```sh
yarn               # install
yarn ios           # build & run on iOS Simulator (requires Xcode)
yarn android       # build & run on Android emulator/device (requires Android Studio)

yarn typecheck     # tsc --noEmit
yarn test          # jest
yarn format        # prettier --write .
```

`yarn ios` / `yarn android` generate the native projects via `expo prebuild` on first run, then build and install a real native binary on the simulator/device — no Expo Go required. First build takes ~2–5 min (cold pod install / Gradle); subsequent runs are fast.

The app loads CNB data on first launch — an internet connection is needed for the initial fetch.

## Project structure

```
src/
├── api/cnb/         CNB client, parser, React Query hooks
├── components/      Shared UI: cards, charts, calculator, currency picker
├── hooks/           Cross-screen helpers (e.g. useRatesWithCZK)
├── lib/             Pure logic: conversion math, insights, formatting
├── navigation/      Bottom tab navigator
├── screens/         TodayScreen, ConverterScreen, TimingScreen
├── state/           Zustand store for shared converter state
└── theme.ts         Colors, spacing, typography tokens
```

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Expo SDK 54 (blank-typescript), React Native 0.81, React 19 |
| Architecture | New Architecture enabled (Fabric + TurboModules + JSI) |
| Navigation | `@react-navigation/bottom-tabs` |
| Server state | `@tanstack/react-query` + AsyncStorage persister |
| Client state | `zustand` |
| Styling | `styled-components/native` v6 |
| Charts | `react-native-gifted-charts` (SVG) |
| Tests | Jest 29 + `jest-expo` |

## Architecture decisions

- **Expo, not bare RN.** `create-expo-app` is the current React Native team recommendation and gives a friction-free dev loop on iOS, Android, and Web from a single codebase.
- **React Navigation, not Expo Router.** The assignment specifies React Navigation; bottom tabs map naturally to the three screens.
- **Two state layers, by purpose.** React Query owns server state (fetching, caching, retries, persistence). Zustand owns the small amount of cross-screen UI state (selected currencies, current amount) that needs to stay in sync between Today, Converter, and Timing.
- **Pure logic in `lib/`.** Conversion math, insight builders, picker section grouping, and CNB parsing are plain functions with focused unit tests — no React, no mocks, fast feedback.
- **Yearly endpoint for recent rates.** The Insights tab (one full business year, 252 days) and the Converter chart (1W to 6M) both read from CNB's `year.txt` aggregate via a per-year React Query cache, so the entire history view costs 1–2 requests instead of N daily round-trips. The daily endpoint is still used on the Today screen and the picker, where country / currency-name labels matter.
- **Insights — mode of weekly winners, not bucket means.** "Best day of week" doesn't average rates per weekday (noisy and easily flipped by window choice on liquid pairs). It groups fixings by week, picks the day with the highest rate in each week, and takes the mode of those winners. The mode count is scored against a uniform-chance multinomial via Monte Carlo, and the resulting p-value drives a `high` / `medium` / `low` confidence badge. The default surfaces the pattern even when weak and lets confidence carry the caveat; a strict-gate mode (`pValueThreshold: 0.05`) is available per-call.
- **Jest pinned to 29.** `jest-expo@54` doesn't yet support Jest 30 — pinning avoids transform errors during test runs.
- **`styled-components` v6 only.** v6 ships its own types, so the legacy `@types/styled-components*` packages were removed to avoid type conflicts.

## Testing

Tests focus on the parts where bugs are easy to ship and easy to verify:

- CNB response parsing (with a captured fixture)
- Conversion math and rounding
- Calculator state machine
- Chart series and insight builders
- Currency picker section grouping
- One mocked render test for the converter form

React Navigation flows are exercised manually rather than under Jest.

## Submission notes

- The Converter opens in the assignment's requested CZK → foreign flow by default (`CZK → USD`) and supports bidirectional conversion thereafter.
- Conversion Timing is a bonus tab. It surfaces "best weekday" and "best part of month" patterns over a year of CNB data, with confidence labels driven by a multinomial-max significance test against the uniform-chance baseline. The Converter screen also picked up a bonus yield chart (1W–6M with period stats).

For the full requirements checklist, decision log, scope caveats, and instructions for generating native projects, see [SUBMISSION.md](./SUBMISSION.md).
