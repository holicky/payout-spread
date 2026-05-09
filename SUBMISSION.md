# Submission notes

Companion to the [README](./README.md). The README explains the product; this document maps the implementation back to the brief and records the reasoning behind the non-obvious choices.

## How I approached this

A short personal note before the checklist, because the brief leaves a lot of room and I'd rather be explicit about how I read it than have a reviewer guess.

**On the spec.** The brief is open in places where there's no single right answer — bare React Native vs. Expo, Expo Router vs. `react-navigation`, Context vs. a small store, where to draw the line on tests, what counts as a "good enough" bonus. I picked the option I'd defend in a code review at a real product team and tried to write down why in the [Decision log](#decision-log) below. If any specific call feels off to you, I'm happy to walk through the alternative I considered and what I traded away.

**Where I spent the most time.** Not on the code per se — on making sure the app feels like a thing someone would actually use. That meant:

- A converter that behaves the way Wise / Revolut / Xe behave (live updates, swap direction, calculator-style entry) instead of a literal-but-clumsy form.
- A bonus surface (split across two tabs) that tells the user something they couldn't compute from the rate list themselves: a yield chart on Converter showing how recent rate movements would have changed the payout, and a "best weekday / best part of month" pattern detector on Conversion Timing — with confidence labels that are honest about how strong (or weak) the signal really is.
- Small native touches (haptics on key actions, pull-to-refresh, AsyncStorage-backed cold start, edge-to-edge on Android) so the app doesn't read as a web form pasted into a phone.
- Copy and number formatting that takes the user seriously — Czech-style separators where appropriate, plain-language insights, no jargon.

**On UI inspiration.** I drew from existing finance/conversion apps for layout, interaction patterns, and the calculator keypad. Currency apps are a solved interaction-design problem; reinventing the wheel would cost time and almost certainly produce something worse. The product thinking is in **what we show** (yield over time for a planned payment, not just a rate ticker) rather than in inventing novel widgets.

**On the code.** Same logic applies — there are several reasonable ways to structure an app this size. Mine prioritises: pure functions in `lib/` that are trivial to test, server vs. UI state living in different stores so neither has to lie about what it owns, and screens that compose small pieces rather than holding lots of state themselves. It's not the only good shape, but it's one I'd be comfortable handing to a teammate.

## Requirements checklist

| Requirement | Status | Where to look |
| --- | --- | --- |
| Fetch CNB exchange rates on app start | ✅ | `src/api/cnb/client.ts`, `useDailyRates.ts` |
| Parse the CNB `daily.txt` payload | ✅ | `src/api/cnb/parser.ts` (+ `parser.test.ts` with captured fixture) |
| Display rates in a clear, structured layout | ✅ | `TodayScreen.tsx`, `RateCard.tsx` |
| Conversion form: amount in CZK + target currency | ✅ | `ConverterScreen.tsx`, `ConversionForm.tsx` |
| Live conversion result (no submit button required) | ✅ | `lib/convert.ts`, recomputed on every keystroke |
| Multiple screens | ✅ | Today, Converter, Conversion Timing |
| `react-navigation` for navigation | ✅ | `src/navigation/RootTabs.tsx` (bottom tabs v7) |
| TypeScript + Hooks | ✅ | Strict TS, function components only |
| Styled Components | ✅ | `styled-components/native` v6 |
| React Query | ✅ | `@tanstack/react-query` v5 + AsyncStorage persister |
| Regular commits | ✅ | See `git log` — feature-scoped commits |
| GitHub repo | ✅ | This repository |
| Bonus feature | ✅ | **Conversion Timing** screen (separate tab) |

## Bonus: Conversion Timing tab + Converter yield chart

The brief asks for a converter and a "more screens" bonus. The bonus came in two pieces, on two tabs, both feeding off the same yearly CNB data.

**Conversion Timing tab** answers: *"if I do one conversion per week, which weekday tends to give me the best rate?"*

- For each week in the last business year, picks the day with the highest CZK / foreign rate, and tallies which weekday "wins" most often. Same logic for month-thirds (early / mid / late).
- Tests the mode against a uniform-chance multinomial via Monte Carlo (1000 iterations) and labels the result `high` / `medium` / `low` confidence based on the p-value.
- Loose default: always surfaces the pattern but flags weak signal honestly. For major-pair CZK rates the badge will usually be `low`. The choice was deliberate — show the data and label its weakness rather than gate it out and leave a blank screen, which is what a stricter `p < 0.05` filter would do.

**Converter yield chart** sits below the conversion form. It shows how the same conversion would have performed over a selectable window (1W / 1M / 3M / 6M), with a stats card highlighting period high / low / change.

Why these and not, say, dark mode: the brief explicitly excludes light/dark mode as a bonus. Both bonus surfaces reuse the existing converter state (amount + currency pair) and turn it into something the user couldn't compute themselves from the Today screen, which felt like a stronger product story than a cosmetic toggle.

## Decision log

### Expo SDK 54 (managed) over bare React Native
Faster dev loop on iOS/Android/web from one codebase, and `create-expo-app` is the current React Native team recommendation. New Architecture (Fabric + TurboModules + JSI) is enabled by default in SDK 54; all chosen native deps are New Arch–compatible.

### `react-navigation` bottom tabs (not Expo Router)
The brief specifies `react-navigation`. Three peer screens map naturally to bottom tabs — no nested stacks needed.

### State split: React Query for server, Zustand for shared UI
React Query owns CNB data (fetching, caching, retries, AsyncStorage persistence). Zustand holds the small slice of UI state that needs to stay in sync across Today, Converter, and Timing — selected currencies and the active amount. Putting that in Context would cause unnecessary re-renders; putting it in React Query would conflate server cache with client preferences.

### Bidirectional converter (defaulting to CZK → foreign)
The brief asks for CZK → target. The Converter opens in exactly that flow on first launch (`CZK → USD`), so the brief's primary path is intact. After that, the user can swap directions. Anyone who's used Wise, Revolut, or Xe expects bidirectional conversion; a fixed source field reads as a missing feature. Bidirectional is a strict superset of the brief.

### Pure logic in `src/lib/`
Conversion math, insight builders, calculator state, picker section grouping, and CNB parsing are plain functions. They're easy to unit test, fast to run, and don't depend on React. Tests live next to the code.

### `styled-components` v6 only
v6 ships its own types. The legacy `@types/styled-components*` packages target v5 and were removed to avoid type conflicts.

### Jest pinned to 29
`jest-expo@54` doesn't yet support Jest 30. Pinning avoids transform errors during test runs.

### Yearly endpoint for all recent-rates consumers
Both the Insights tab (one full business year — 252 days) and the Converter history chart (1W to 6M) source data from CNB's `year.txt` endpoint, cached per-year in React Query. The longest window costs 1 request (or 2 across a year boundary) instead of ~50 daily round-trips, and the per-year cache is shared across screens. The daily endpoint is still used for the Today screen and the picker, where country and currency-name labels matter.

### Insights methodology — mode of weekly winners with multinomial-max significance test
First pass averaged rates per weekday and picked the argmax. That's the standard naive approach and it's noisy: the "winner" flipped between Mon and Wed just by extending the data window from 90 to 252 days, because there isn't a real weekday effect on liquid CZK pairs to begin with. Replaced with: group fixings by week → pick the day with the highest rate in each week → take the mode of those winners. Same pattern for month-thirds.

Significance is then estimated by simulating the multinomial-max distribution under the uniform-chance null (each weekday has 1/5 chance of being the weekly winner). The resulting p-value drives a `high` / `medium` / `low` confidence badge. The screen ships with a loose default — it always surfaces the mode and lets the badge carry the caveat — because a strict `p < 0.05` gate would leave the screen blank for almost all major-pair CZK conversions, which is technically correct but useless. A strict-gate mode (`pValueThreshold: 0.05`) is available per-call where empty-when-noise is the desired behaviour.

### React Query persistence to AsyncStorage
Cold starts show the last-known rates immediately, before the network round trip resolves. Cheap to add, noticeably better first-paint.

### Tests focus on logic, not navigation
Unit tests cover parsing, conversion math, calculator state, chart series, insight builders, and picker sections — places where regressions would silently change user-visible numbers. One mocked render test exercises the converter form. React Navigation flows are verified manually; testing them under Jest would add fragility without catching meaningful bugs at this scope.

## Trade-offs and what was deliberately out of scope

- **No dark mode.** Explicitly excluded by the brief as a valid bonus.
- **No i18n.** Single-locale (Czech-style number formatting where appropriate, English UI copy). Adding `i18next` is straightforward but wasn't part of the brief.
- **No e2e tests.** Detox/Maestro would be the right tool but oversized for a take-home; the unit tests cover the logic that matters most.
- **No analytics or error reporting.** Sentry/PostHog would be the production move; adding them would have been noise here.
- **No CI workflow checked in.** `yarn typecheck` and `yarn test` are the local gates; wiring up GitHub Actions felt like ceremony for a single-author repo.
- **Phone-only verification.** `app.json` declares `supportsTablet: true`, but layout was only tested on phone form-factors (iPhone simulator + Android emulator at standard resolutions). Tablet/foldable layouts haven't been exercised and may need spacing tweaks.
- **Stock Expo graphics.** The icon, splash, adaptive icon, and favicon under `assets/` are the default Expo placeholders. Designing custom branding (logo, icon set, splash artwork, screenshot frames) is a design exercise outside the scope of this brief.

## Native projects (iOS / Android folders)

This is an **Expo managed** project, so `ios/` and `android/` folders are intentionally not checked in. Native code is generated on demand from `app.json` and the installed packages — the same pattern most modern Expo apps use.

If a reviewer wants to inspect or build native code locally, generate it with:

```sh
npx expo prebuild           # creates ios/ and android/ from app.json
npx expo run:ios            # build & run via Xcode toolchain
npx expo run:android        # build & run via Gradle
```

Running `prebuild` is also the supported path to "go bare" — once the native folders exist, they can be committed and edited directly. Reference: [Expo — Continuous Native Generation](https://docs.expo.dev/workflow/continuous-native-generation/) and [Adopting prebuild](https://docs.expo.dev/guides/adopting-prebuild/).

For day-to-day development the managed flow is sufficient: `yarn ios` / `yarn android` / `yarn web` start the dev client without ever needing to touch native projects.

## Running it

See [README → Getting started](./README.md#getting-started). Short version:

```sh
yarn
yarn ios       # or: yarn android, yarn web
yarn typecheck
yarn test
```
