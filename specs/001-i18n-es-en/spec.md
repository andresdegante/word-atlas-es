# Feature Specification: Multi-language Support (Spanish, English, Chinese)

**Feature Branch**: `001-i18n-es-en`

**Created**: 2026-10-28

**Status**: Approved

**Input**: User description: "lo puedes configurar a ingles o a español"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch Application Language to Spanish or English (Priority: P1)

Users want to experience the Word Atlas interface in Spanish (`es`) or English (`en`) by default (instead of Chinese), and easily switch between Spanish, English, and Chinese from the top navigation bar or settings page.

**Why this priority**: The entire application UI is currently hardcoded in Chinese (`zh`), making it unusable for Spanish or English speakers without translation.

**Independent Test**: Open the application; verify the interface renders in Spanish by default and can be toggled to English or Chinese via the header language selector or Settings page, immediately updating all navigation, buttons, labels, topics, and dialogs.

**Acceptance Scenarios**:

1. **Given** a user opens Word Atlas for the first time, **When** the page loads, **Then** the UI defaults to Spanish (`es`) (or matches browser preference between `es`/`en`) and displays a language selector in the top bar and settings.
2. **Given** the user is on any page, **When** the user selects `EN` (English) or `ES` (Español) from the language switcher, **Then** all navigation items, page titles, buttons, topic names, and controls immediately update to the chosen language and persist across reloads.

---

### User Story 2 - English Definitions & Clean Learning Cards in ES/EN Mode (Priority: P1)

When learning, reviewing, or browsing words in English or Spanish mode, users see the English definitions (which are included in the dataset) and English examples prominently on cards, quizzes, and search results instead of Chinese text when Chinese is not selected.

**Why this priority**: Even with a translated UI, if quiz options and word cards only show Chinese definitions, a non-Chinese speaker cannot complete quizzes or understand word cards.

**Independent Test**: Start a learning session or open a word card while in Spanish or English mode; verify that word cards, meaning quizzes, and typing prompts display the English definition and part of speech clearly.

**Acceptance Scenarios**:

1. **Given** the language is set to `es` or `en`, **When** a user views a word card or meaning quiz, **Then** the primary definition shown is the English definition from the dataset alongside the part of speech.
2. **Given** the language is set to `es` or `en`, **When** a user browses the Atlas grid/list or searches in the command palette, **Then** topic names and UI labels are localized in the selected language.

---

### Edge Cases

- What happens when an entry only has a compact index row loaded (before its full chunk is fetched)? The system loads or falls back gracefully to the available definition or preloads the English sense for quiz options.
- How does the system handle existing saved settings in `localStorage`? Existing settings without a `lang` field default to `"es"`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support three UI languages: Español (`es`), English (`en`), and 中文 (`zh`), with Español (`es`) as the default.
- **FR-002**: Users MUST be able to switch languages from both the top navigation bar (quick switcher) and the Settings ("Mi cuenta" / "Me") page.
- **FR-003**: System MUST translate all UI views: Topbar, Bottom Tabbar, Today dashboard, Atlas browser (including all 19 IELTS topic names and CEFR level names), Learn/Quiz runner, Practice typing studio, Me/Settings page, Onboarding modal, Splash screen, About page, and Share cards.
- **FR-004**: In `es` and `en` modes, quizzes ("meaning", "picture", "spell") and word entry views MUST display the English definition (`sense.en`) as the primary meaning instead of requiring Chinese reading comprehension.
- **FR-005**: System MUST persist the selected `lang` preference in `localStorage` under `word-atlas:settings`.

### Key Entities

- **Language (`Lang`)**: `"es" | "en" | "zh"` stored in user `Settings`.
- **Translation Dictionary (`i18n`)**: Structured translation catalog mapping UI keys, topic slugs, and dynamic templates to `es`, `en`, and `zh`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of navigation, page headers, buttons, settings, and topic filters render in Spanish (`es`) and English (`en`) when selected.
- **SC-002**: Language switching updates the active view in under 50ms without requiring a full page reload.
- **SC-003**: Users in `es` or `en` mode can complete an entire learning session (Intro, Meaning Quiz, Picture Cloze, Listen, Spell, Summary) using English definitions and localized instructions.

## Assumptions

- The dataset's built-in English definitions (`senses[].en`) and English example sentences (`ex[].en`) are used for vocabulary content when in `es` or `en` mode, while all UI chrome, instructions, and 19 topic categories are fully translated to both Spanish and English.
