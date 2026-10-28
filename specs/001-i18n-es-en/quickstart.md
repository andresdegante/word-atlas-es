# Quickstart Validation: Multi-language Support (ES / EN / ZH)

## Prerequisites
- Node.js 20+
- Dependencies installed (`npm ci`)

## Verification Steps
1. Run unit tests:
   ```bash
   npm test
   ```
2. Run build check:
   ```bash
   npm run build
   ```
3. Open `http://localhost:5188/`:
   - Verify the UI loads in **Español (`ES`)** by default.
   - Click the `ES / EN` language toggle in the top bar to switch between **Español** and **English** (and **中文** in Settings).
   - Open any word card or start a learning session and verify definitions, prompts, and buttons appear in the selected language.
