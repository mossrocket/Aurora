# Aurora Health — NOAA swap changeset

## New files (create these)
- `api/noaa/get-kp-index.js` — planetary Kp nowcast from NOAA SWPC
- `api/noaa/get-ap-index.js` — 24-hour running a-index from the same feed
- `api/noaa/get-kp-forecast.js` — 3-day Kp forecast (not yet consumed by the UI)

## Files replaced (overwrite the existing ones)
- `src/AuroraHealth.jsx`
- `README.md`

## Files you can delete if you want (optional cleanup)
Nothing in the new code calls these anymore:
- `api/sws/get-k-index.js`
- `api/sws/get-a-index.js`
- `api/sws/get-dst-index.js`

Leaving them in place is harmless. Deleting them keeps the repo tidy.

## No changes needed
- `vercel.json` — the generic `/api/(.*)` rewrite already covers `/api/noaa/*`.
- `package.json`, `vite.config.js`, `index.html`, `public/*` — untouched.

---

## What changed and why

### Data source: BOM → NOAA
Old path: `/api/sws/get-k-index` → BOM `get-k-index` with `location: "Australian region"` → **Kaus (Australian regional K)**, not planetary Kp.
New path: `/api/noaa/get-kp-index` → NOAA SWPC `noaa-planetary-k-index.json` → **planetary Kp**, rounded to 0–9 integer.

This fixes the mismatch where the app displayed `1` while planetary Kp was `3`. Kaus regularly sits 1–2 points below planetary Kp; the two aren't interchangeable, and Aurora Health's correlation content is based on planetary-Kp literature.

### Security
- No API key travels in URL query strings anymore (NOAA is keyless). Rotate the old SWS key at your convenience.
- Settings UI no longer asks for an SWS key; replaced with a short "data source" blurb.

### Failure handling
- `fetchSolar()` logs a `console.warn` on upstream failure instead of swallowing silently.
- The "Sample data" amber badge on the dashboard now appears any time live data failed — previously it was suppressed whenever a key had been entered, which hid real failures.

### Content edits to `HEALTH_RULES`
Each change either fixes a factual error, softens overclaiming language to match the Learn tab's correlation-vs-causation framing, or removes a specific medical prescription:

| Condition · threshold | Before (gist) | After (gist) |
|---|---|---|
| Migraines · max 6 | "is raising migraine risk", tip prescribed "magnesium" | "some people prone to migraines report more sensitivity", tip is rest/dim lighting/hydration |
| Migraines · max 9 | "risk is at its highest", tip said "strongly consider staying indoors" | "may experience heightened symptoms", tip points to "your usual migraine care plan" |
| Heart Health · max 9 | tip said "contact your doctor" | tip points to "your usual care plan" |
| Joint Pain · max 2, 4 | described "stable atmospheric conditions" / "minimal pressure changes" (factually conflates weather with space weather) | reframed as calm solar conditions |
| Joint Pain · max 6 | claimed "solar activity can shift atmospheric pressure" (**factually wrong** — geomagnetic activity doesn't meaningfully change barometric pressure) | "some people with chronic joint conditions report more discomfort ... evidence is limited" |
| Joint Pain · max 9 | tip prescribed "pain relief medication" | tip says "rest, apply heat, follow your usual care plan" |
| Sleep Quality · max 9 | tip prescribed "magnesium supplements" | tip is caffeine/screen hygiene only |
| Fatigue · max 6 | tip prescribed "iron-rich foods" | tip is just pacing and rest breaks |
| Neurological · max 9 | tip said "contact your neurologist ... keep medications accessible" | tip points to "your usual care plan" |

The existing `<Disclaimer/>` component already appears on the Today tab. Nothing changed there.

---

## To deploy

Drop the files in, commit, push. Vercel will rebuild. First request against `/api/noaa/get-kp-index` will populate the edge cache; subsequent requests within 5 min serve from cache.

Test locally or against the preview deployment:

```
curl https://<your-preview>.vercel.app/api/noaa/get-kp-index
# → {"data":[{"index":4,"raw_kp":3.67,"valid_time":"2026-04-18 18:00:00",...}]}
```
