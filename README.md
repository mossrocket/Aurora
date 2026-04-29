# Aurora Space Health ☀️

https://AuroraSpace.health

Sync Your Wellbeing with the Cosmos.

Do you ever feel "off" for no clear reason? Your body might be reacting to the world beyond our atmosphere. Aurora Space Health is the first wellness companion that connects live space weather data from NOAA directly to your personal health. By tracking the Earth's geomagnetic activity (Kp-index), Aurora helps you identify hidden environmental triggers for migraines, heart health, and sleep quality.

## Key Features:
- **Live NOAA Integration**: Real-time tracking of the Kp-index and A-index—the gold standards for measuring disturbances in Earth's magnetic field.
- **Personalized Alerts**: Receive "Caution" notifications when solar activity peaks, specifically tailored to your sensitivity for migraines, joint pain, or fatigue.
- **Evidence-Based Insights**: Built on heliobiology research linking geomagnetic storms to shifts in heart rate variability (HRV) and circadian rhythms.
- **Privacy-First Diary**: Track your daily symptoms alongside cosmic shifts to discover your own "Space Weather Sensitivity."

## Live solar data

Live data is pulled from the US **NOAA Space Weather Prediction Center (SWPC)**. No sign-up, no API key, no configuration — it just works on first load. The app fetches:

- **Planetary Kp** (estimated, updated every 3 hours, or on refresh) — `/api/noaa/get-kp-index`
- **Running a-index** (24-hour equivalent amplitude) — `/api/noaa/get-ap-index`
- **3-day Kp forecast**  — `/api/noaa/get-kp-forecast`

If the upstream is unreachable, the app falls back to sample data and shows a "Sample data" badge on the dashboard so you know you're not looking at live values.

## Tech stack

- **React 18** + **Vite 5** — fast dev and build
- **Lucide React** — consistent icon set
- **DM Sans** — clean, modern typography
- **vite-plugin-pwa** — service worker + manifest generation
- **WCAG AA compliant** — all text passes 4.5:1 contrast ratio

## Medical disclaimer

Aurora Space Health is for informational purposes only. It surfaces correlational research between geomagnetic activity and health, and does **not** provide medical advice, diagnosis, or treatment. Always consult a qualified health professional for health decisions.

## License

Copyright Peter Alan Gray 2026 
ALL RIGHTS RESERVED

Buy me a coffee? 
https://buymeacoffee.com/auroraspacehealth
