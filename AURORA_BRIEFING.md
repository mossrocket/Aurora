# Aurora Health — Project Briefing for Cowork

## What is Aurora Health?
A Progressive Web App that translates space weather (geomagnetic activity) into personalised health insights. It monitors solar activity and shows users how it may affect conditions like migraines, heart health, mental health, joint pain, sleep quality, and fatigue.

**Live site:** https://aurora-woad.vercel.app/
**GitHub repo:** https://github.com/mossrocket/AuroraHealth
**Tech stack:** React 18 + Vite 5 + Lucide React icons + DM Sans font + vite-plugin-pwa
**Target audience:** Female-leaning, health-conscious community interested in space weather effects on wellbeing

---

## Design decisions already made

### Visual & UX
- **Material Design 3** language — tonal surfaces, elevation shadows (3 tiers), soft corners (16/12/8px)
- **DM Sans** font at weights 400–600 (intentionally light, not heavy)
- **Dark theme** — deep navy (#060b16) background with aurora-inspired accents: green (#45dba8), purple (#a78bfa), rose (#f472b6), amber (#fbbf24)
- **Logo** is embedded as base64 data URI in the artifact version; as `/Auroralogo.png` in the deployed version. It's the aurora-with-ECG-line image.
- Header shows logo + "Hello, [name]" — no "Aurora" text (waiting for a designed wordmark logo later)

### Information architecture (dashboard order)
1. Date + heading: "How space weather may affect you"
2. Active alerts (only when conditions are moderate/high)
3. "Conditions you're tracking" — health condition cards (expandable)
4. Solar activity bar (UV-index style, not raw numbers)
5. "Did you know" educational aside

### Content & labelling choices
- Risk badges say **"All clear" / "Caution" / "Alert"** — NOT Low/Moderate/High (because "Sleep Quality: Low" implies bad sleep)
- Section heading is "Conditions you're tracking" — NOT "Your conditions" (sounds like a diagnosis)
- Dashboard title is "How space weather may affect you" — NOT "Your health overview" (overpresumptive)
- All emoji replaced with **Lucide React icons** (Brain, Heart, SmilePlus, Bone, Moon, BatteryLow, etc.)
- Solar forecast section uses a **colour gradient bar** (like UV index) with a dot marker — NO raw Kp numbers, NO A-index, NO Dst (nT), NO jargon pills

### Tabs
1. **Today** (Sun icon) — main dashboard
2. **Alerts** (AlertTriangle icon) — filtered alert view
3. **Learn** (BookOpen icon) — science explainers with citations
4. **Settings** (Settings icon) — profile, conditions, sensitivity, API key, Buy Me a Coffee, restart onboarding

### Accessibility (WCAG AA)
- All text passes 4.5:1 contrast against #060b16 background
- Proper semantic HTML: header, main, nav, section, article, aside
- All interactive elements are buttons/labels/inputs (no clickable divs)
- aria-expanded, aria-controls, aria-selected, role="tablist", role="alert", role="progressbar"
- Skip-to-content link, sr-only labels, fieldset/legend for grouped controls
- Focus-visible outlines (purple)
- Focus management on tab changes

### Data & persistence
- User preferences (name, conditions, sensitivity, API key, onboarded flag) persist via **localStorage** under key "aurora_prefs"
- Solar data fetched from SWS API with fallback to mock data (Kp: 4, A-index: 18)
- PWA configured with service worker, manifest, 192px and 512px icons

---

## UX Audit — Outstanding issues (prioritised)

### HIGH priority
1. **No medical disclaimer anywhere** — The app gives health guidance ("contact your doctor", "take preventative measures") without any visible disclaimer. Needs a persistent, non-dismissable notice. This is a liability risk for community sharing.

### MEDIUM priority
2. **Sensitivity setting does nothing** — Users choose Low/Medium/High during onboarding and in settings but the value never affects thresholds, tips, or alert frequency. Broken promise — if it exists, it must do something.
3. **Condition descriptions still contain jargon** — Phrases like "Kp index detected", "barometric shifts affecting joint inflammation", "cellular energy processes" appear in health cards. The audience won't know what Kp means.
4. **Alerts tab duplicates dashboard** — Shows the same cards that appear as "Active alerts" on the dashboard. Users with no alerts see an empty page. Consider: alert history, notification preferences, or merge into dashboard.
5. **Onboarding allows zero conditions** — Deselecting all conditions and tapping Next silently falls back to ["Migraines"]. Should disable the button with a prompt.
6. **No loading/empty state clarity** — "Scanning solar activity…" appears while API (which will fail) is called, then mock data appears instantly. Should show sample data immediately with a clear "sample data" indicator.

### LOW priority
7. **"Did you know" is static** — Same fact every visit. Should rotate tips and/or link to Learn tab.
8. **Refresh button spins once, not continuously** — Single 360° transform doesn't loop during fetch.
9. **No pull-to-refresh on mobile** — Users instinctively pull down; they have to find the small header icon.
10. **All-clear days are scroll-heavy** — When every condition is "All clear", the dashboard is a list of identical green cards. A compact summary strip would reduce scroll depth.
11. **4-tab nav bar crowding on small screens** — Could be an issue at 320px width if more features are added.
12. **No explanation of what "tracking" means in onboarding** — Step 2 needs a line like "We'll show you how today's solar activity may affect these areas."

---

## Opportunities (future features)

- **Push notifications** — Alert users when solar conditions change. Killer feature for daily engagement.
- **Share daily snapshot** — Generate a card image for social media/messaging. Organic growth in aurora/health communities.
- **7-day history** — Simple historical view of the solar activity bar to help users spot patterns.
- **Personal symptom logging** — "How are you feeling today?" to build personal correlation data over time.
- **Live solar data proxy** — The SWS API needs a server-side proxy to avoid CORS. A Vercel serverless function would work.

---

## Learn tab content (already built)

Contains 8 expandable science cards with plain-English explainers and linked citations from:
- Weydahl et al. (2001) — melatonin and geomagnetic activity
- Burch et al. (2008) — melatonin metabolite excretion
- PMC meta-analysis (2024) — MI/ACS/stroke risk (RR 1.3–1.6)
- Communications Medicine (2024) — São Paulo cardiac admissions study
- PMC Review (2023) — biological effects of magnetic storms
- ScienceDirect (2025) — geomagnetic storms and depression mechanisms
- Babayev (2007) — geomagnetic activity and psychological state

Final card is an honest disclaimer about correlation vs causation.

---

## Settings page includes
- Profile (name input)
- Tracked conditions (checkbox list)
- Sensitivity level (Low/Medium/High radio)
- Data source (SWS API key input, optional)
- Buy Me a Coffee link → https://buymeacoffee.com/aurorahealth
- Restart onboarding button

---

## File structure
```
aurora-health/
├── index.html
├── package.json
├── vite.config.js        # Vite + React + PWA plugin
├── .gitignore
├── README.md             # Deployment guide (Vercel/Netlify/GH Pages + app store roadmap)
├── public/
│   ├── Auroralogo.png
│   ├── icon-192.png
│   └── icon-512.png
└── src/
    ├── main.jsx
    └── AuroraHealth.jsx  # Single-file app component (~850 lines)
```

The app is a single React component. When the codebase grows, consider splitting into: components/, hooks/, data/, theme/, and pages/.
