# Aurora Health ☀️

**Your personal solar health companion** — translating space weather into clear, actionable health insights.

Aurora Health monitors geomagnetic activity (Kp index, A-index, Dst) and shows how solar weather may affect conditions like migraines, heart health, mental health, joint pain, sleep quality, and fatigue.


## PWA — installable on phones

This is a Progressive Web App. When users visit the link on mobile:
- **Android**: Chrome shows an "Add to Home Screen" prompt automatically
- **iOS**: Tap Share → "Add to Home Screen"

It will appear as a standalone app with your Aurora logo, dark splash screen, and no browser chrome.

## Live solar data

By default, the app uses sample data. To connect live data from the Australian Bureau of Meteorology Space Weather Services:

1. Request an API key at [sws.bom.gov.au](https://sws.bom.gov.au)
2. Enter it in Settings → Data Source within the app

## Tech stack

- **React 18** + **Vite 5** — fast dev and build
- **Lucide React** — consistent icon set
- **DM Sans** — clean, modern typography
- **vite-plugin-pwa** — service worker + manifest generation
- **WCAG AA compliant** — all text passes 4.5:1 contrast ratio

## License

MIT
