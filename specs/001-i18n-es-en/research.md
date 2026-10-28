# Research: Multi-language Support (ES / EN / ZH)

## Decision 1: Default & Supported Languages
- **Decision**: Support `"es"` (Español), `"en"` (English), and `"zh"` (中文), with `"es"` as the default setting so the user immediately sees the interface in Spanish and can switch to English (`EN`) with one click in the top bar or Settings.
- **Rationale**: User asked *"lo puedes configurar a ingles o a español"*; providing both with a 1-click toggle (`ES | EN | 中文`) in the header and Settings satisfies both options simultaneously.
- **Alternatives considered**: Hardcoding only one language (rejected because a toggle between ES and EN is much more flexible).

## Decision 2: Vocabulary Definitions in ES/EN Mode
- **Decision**: Each entry in `public/atlas/entries/*.json` already contains high-quality English definitions (`senses[].en`) and English examples (`ex[].en`). In `es` and `en` modes:
  - `EntryView` displays `s.en` as the primary definition (and optionally shows `s.zh` only in `zh` mode).
  - `Learn.tsx` (Meaning quiz, Spell prompt, Feedback) uses `entry.senses[0].en` when `lang !== "zh"`. For Meaning quiz options (`options`), `Learn.tsx` already prefetches the chunk entries (`prefetch(atlas, ids)`), and we can also prefetch option entries so `atlas.peek(o.id)?.senses[0]?.en` is available for every multiple-choice option.
- **Rationale**: Eliminates Chinese reading requirement during quizzes when using the app in Spanish or English.
