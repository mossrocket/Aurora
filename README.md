# Aurora Health ☀️

**Your personal solar health companion** — translating space weather into clear, actionable health insights.

Aurora Health monitors geomagnetic activity (Kp index, A-index, Dst) and shows how solar weather may affect conditions like migraines, heart health, mental health, joint pain, sleep quality, and fatigue.


## Live solar data

By default, the app uses sample data. To connect live data from the Australian Bureau of Meteorology Space Weather Services:

1. Request an API key at [sws.bom.gov.au](https://sws.bom.gov.au)
2. Enter it in Settings → Data Source within the app

> **Note:** The SWS API requires a proxy to avoid CORS issues in the browser. For production, set up a simple API route (e.g. on Vercel serverless functions) that proxies requests to `https://sws-data.sws.bom.gov.au/`.

## Tech stack

- **React 18** + **Vite 5** — fast dev and build
- **Lucide React** — consistent icon set
- **DM Sans** — clean, modern typography
- **vite-plugin-pwa** — service worker + manifest generation
- **WCAG AA compliant** — all text passes 4.5:1 contrast ratio

## License

MIT
