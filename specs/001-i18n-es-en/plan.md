# Implementation Plan: Multi-language Support (Spanish, English, Chinese)

**Branch**: `001-i18n-es-en` | **Date**: 2026-10-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-i18n-es-en/spec.md`

## Summary

Configure **Word Atlas** to support **Spanish (`es`)** and **English (`en`)** alongside the original **Chinese (`zh`)**, defaulting to **Spanish (`es`)**. Provide an instant language switcher in the top navigation bar and in the Settings page (`Me.tsx`), localize all UI components, pages, topics, and dialogs, and display English definitions (`sense.en`) prominently on word cards and quizzes when in `es` or `en` mode.

## Technical Context

**Language/Version**: TypeScript ~5.9.3, React 19.2.0

**Primary Dependencies**: `react`, `react-dom`, `lucide-react`, `ts-fsrs`, `vite`

**Storage**: `localStorage` (`word-atlas:settings` and `word-atlas:v2:*`)

**Testing**: Node test runner (`node --import tsx --test src/**/*.test.ts`)

**Target Platform**: Modern Web Browsers (Desktop & Mobile)

**Project Type**: Web Application (SPA)

**Performance Goals**: Instant UI language toggle (<16ms re-render), zero network overhead for UI translations

**Constraints**: Preserve existing offline-first architecture and FSRS spaced repetition progress

**Scale/Scope**: 7,298 vocabulary entries, 6 pages, 10 UI components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Zero external runtime bloat: Lightweight typed `src/lib/i18n.ts` dictionary module using the existing `useStore` hook.
- Backward-compatible settings: `sanitizeSettings` defaults `lang` to `"es"` if unset or invalid.
- All existing unit tests pass.

## Project Structure

### Documentation (this feature)

```text
specs/001-i18n-es-en/
├── plan.md              # Implementation plan
├── research.md          # Phase 0 research decisions
├── data-model.md        # Phase 1 data model & i18n schema
├── quickstart.md        # Phase 1 verification guide
└── tasks.md             # Phase 2 actionable tasks
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── i18n.ts          # New: Typed ES / EN / ZH dictionary, topic translations, and useI18n() hook
│   └── ...
├── store/
│   ├── store.ts         # Updated: Add lang: "es" | "en" | "zh" to Settings (default "es")
│   └── srs.ts           # Updated: Localized formatInterval(ms, lang)
├── pages/
│   ├── Today.tsx        # Updated: Localized dashboard, greetings, streak, topics, level path
│   ├── Atlas.tsx        # Updated: Localized filters, search, status tabs, topic chips
│   ├── Learn.tsx        # Updated: Localized quiz prompts, English definitions for meaning/spell quizzes in ES/EN
│   ├── Practice.tsx     # Updated: Localized typing studio
│   ├── Me.tsx           # Updated: Language selector + localized stats and settings
│   ├── Onboarding.tsx   # Updated: Localized onboarding dialog
│   └── About.tsx        # Updated: Localized about page
├── ui/
│   ├── EntryView.tsx    # Updated: Localized entry sections & primary English sense display in ES/EN
│   ├── Ambience.tsx     # Updated: Localized ambience names and controls
│   ├── Palette.tsx      # Updated: Localized search palette and English/Chinese search
│   ├── Splash.tsx       # Updated: Localized splash copy
│   └── Logo.tsx         # Updated: Brand title adaptation
└── App.tsx              # Updated: Topbar quick language switcher (ES / EN / ZH) & localized navigation
```

**Structure Decision**: Single-project SPA architecture preserved; added `src/lib/i18n.ts` integrated with `src/store/store.ts`.
