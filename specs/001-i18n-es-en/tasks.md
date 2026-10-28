# Tasks: Multi-language Support (Spanish, English, Chinese)

**Input**: Design documents from `/specs/001-i18n-es-en/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

## Phase 1: Setup & Foundational Infrastructure

- [x] T001 Create `src/lib/i18n.ts` with `Lang` type (`"es" | "en" | "zh"`), complete UI translation dictionaries for Spanish, English, and Chinese, topic name translations for all 19 IELTS topics, CEFR level names, and helper functions.
- [x] T002 Update `src/store/store.ts` to add `lang: Lang` (default `"es"`) to `Settings`, `defaultSettings`, `sanitizeSettings`, and localize backup error strings.
- [x] T003 Update `src/store/srs.ts` so `formatInterval` formats time intervals in `es`, `en`, or `zh`.

## Phase 2: User Story 1 - Switch Application Language to Spanish or English (Priority: P1)

**Goal**: Render the entire application interface in Spanish (`es`) or English (`en`) with a quick language switcher in the top bar and Settings page.

**Independent Test**: Toggle `ES` / `EN` / `ZH` in the top bar or Settings (`Me.tsx`) and verify all pages and dialogs update immediately.

- [x] T004 [US1] Update `src/App.tsx` and `src/styles/app.css` to localize topbar/tabbar navigation, add a quick `ES | EN` language switcher button in `.topbar-tools`, and update `document.documentElement.lang`.
- [x] T005 [P] [US1] Update `src/pages/Today.tsx` to localize greetings, date header, journey card, streak panel, galaxy teaser, level path, and topic tiles.
- [x] T006 [P] [US1] Update `src/pages/Atlas.tsx` and `src/galaxy/Galaxy.tsx` to localize search input, level/topic/status filters, result count, empty state, and galaxy HUD/controls.
- [x] T007 [P] [US1] Update `src/pages/Me.tsx` to add the Language (`Idioma / Language / 语言`) setting and localize all stats, heatmap, forecast, settings fields, and backup actions.
- [x] T008 [P] [US1] Update `src/pages/Onboarding.tsx`, `src/pages/About.tsx`, `src/ui/Ambience.tsx`, `src/ui/Splash.tsx`, `src/ui/Logo.tsx`, `src/ui/Sheet.tsx`, and `src/ui/Speak.tsx` to use localized strings.

## Phase 3: User Story 2 - English Definitions & Clean Learning Cards in ES/EN Mode (Priority: P1)

**Goal**: Show English definitions (`sense.en`) and localized prompts in Word Cards, Quizzes, Command Palette, and Typing Practice when in `es` or `en` mode.

**Independent Test**: Open a word card or start a learning/practice session in `es` or `en` mode and verify definitions and quiz options appear in English without requiring Chinese.

- [x] T009 [US2] Update `src/ui/EntryView.tsx` and `src/ui/Palette.tsx` to localize section headers/badges and prioritize English definitions (`s.en`) when `lang !== "zh"`.
- [x] T010 [US2] Update `src/pages/Learn.tsx` and `src/pages/Practice.tsx` to prefetch option entries, display `senses[0].en` for meaning/spell/typing prompts and multiple-choice options when `lang !== "zh"`, and localize all quiz and summary labels.

## Phase 4: Polish & Validation

- [x] T011 Update `index.html` title/lang defaults and run `npm test` and `npm run build` to verify zero TypeScript or test errors.
