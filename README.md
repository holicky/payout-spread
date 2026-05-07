# Payout Spread

A React Native app showing today's CZK exchange rates from the Czech National Bank, a CZK-to-foreign-currency converter, and a "Conversion Timing" view that visualizes how much CZK a foreign payment would yield across recent days.

## Setup

Requires Node 22 (see `.nvmrc`).

```sh
yarn
yarn ios       # or: yarn android, yarn web
yarn typecheck
yarn test
yarn format
```

## Architecture decisions

- **Expo SDK 54 (blank-typescript), RN 0.81, React 19.** Scaffolded with `create-expo-app` — current React Native team recommendation. `react-navigation` is used for routing per assignment; no Expo Router.
- **New Architecture enabled** (Fabric + TurboModules + JSI) — the SDK 54 default. All native deps are New Arch-compatible.
- **Jest 29 (not 30)** — `jest-expo@54` doesn't yet support Jest 30. Pinned explicitly to avoid runtime errors during transform.
- **Test scope is focused:** parser, conversion math, calculator state, chart/insight builders, picker sections, and one mocked converter render test. React Navigation is not under test.
- **Small client-state store.** React Query owns CNB server state; zustand keeps the shared converter amount and selected currencies in sync across screens.
- **styled-components 6** ships its own types — the DefinitelyTyped `@types/styled-components*` packages are for v5 and were removed to avoid type conflicts.

## Submission notes

- `Converter` opens in the assignment's requested CZK-to-foreign flow by default (`CZK -> USD`) and also supports bidirectional conversion.
- `Conversion Timing` is the bonus screen. It uses an aggregate historical CNB query to keep render churn low while showing recent conversion timing patterns.
