# Data Model: Multi-language Support

## 1. `Lang` Type (`src/lib/i18n.ts` & `src/store/store.ts`)

```ts
export type Lang = "es" | "en" | "zh";
```

## 2. `Settings` Extension (`src/store/store.ts`)

- Field: `lang: Lang`
- Default value: `"es"`
- Validation in `sanitizeSettings`: `if (v.lang === "es" || v.lang === "en" || v.lang === "zh") s.lang = v.lang;`

## 3. Topic Localization Map (`src/lib/i18n.ts`)

Maps the 19 topic keys (`education`, `work`, `technology`, `science`, `environment`, `health`, `society`, `government`, `economy`, `media`, `arts`, `travel`, `city`, `nature`, `daily`, `emotion`, `thinking`, `sport`, `history`) to localized names in `es`, `en`, and `zh`.
