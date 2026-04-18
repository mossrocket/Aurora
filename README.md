# Aurora Health ☀️

**Your personal solar health companion** — translating space weather into clear, actionable health insights.

Aurora Health monitors the planetary Kp index and 24-hour a-index, and shows how solar weather may affect conditions like migraines, heart health, mental health, joint pain, sleep quality, fatigue, and other neurological sensitivities.

## PWA — installable on phones

This is a Progressive Web App. When users visit the link on mobile:
- **Android**: Chrome shows an "Add to Home Screen" prompt automatically
- **iOS**: Tap Share → "Add to Home Screen"

It will appear as a standalone app with your Aurora logo, dark splash screen, and no browser chrome.

## Live solar data

Live data is pulled from the US **NOAA Space Weather Prediction Center (SWPC)**. No sign-up, no API key, no configuration — it just works on first load. The app fetches:

- **Planetary Kp** (estimated, updated every 3 hours) — `/api/noaa/get-kp-index`
- **Running a-index** (24-hour equivalent amplitude) — `/api/noaa/get-ap-index`
- **3-day Kp forecast** (planned UI integration) — `/api/noaa/get-kp-forecast`

If the upstream is unreachable, the app falls back to sample data and shows a "Sample data" badge on the dashboard so you know you're not looking at live values.

### Why NOAA rather than BOM?

Earlier versions used the Australian Bureau of Meteorology Space Weather Services API. BOM's feed returns the **Australian regional K index** (locally called Kaus), not the global planetary Kp — they're related but different measurements, and Kaus typically runs 1–2 points below planetary Kp. Since Aurora Health's health-correlation content is based on planetary-Kp literature, NOAA is the correct source regardless of where the user is. NOAA also requires no API key, which removes an entire class of key-leak and rotation concerns.

The legacy `api/sws/*` handlers remain in the repo for reference but are no longer called.

## Tech stack

- **React 18** + **Vite 5** — fast dev and build
- **Lucide React** — consistent icon set
- **DM Sans** — clean, modern typography
- **vite-plugin-pwa** — service worker + manifest generation
- **WCAG AA compliant** — all text passes 4.5:1 contrast ratio

## Medical disclaimer

Aurora Health is for informational purposes only. It surfaces correlational research between geomagnetic activity and health, and does **not** provide medical advice, diagnosis, or treatment. Always consult a qualified health professional for health decisions.

## License

MIT
