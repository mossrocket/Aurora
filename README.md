# Aurora Health ☀️

**Your personal solar health companion** — translating space weather into clear, actionable health insights.

Aurora Health monitors geomagnetic activity (Kp index, A-index, Dst) and shows how solar weather may affect conditions like migraines, heart health, mental health, joint pain, sleep quality, and fatigue.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

The `dist/` folder contains the deployable PWA.

## Deploy (get a shareable link)

### Option A: Vercel (recommended — free, fast)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com), sign in with GitHub
3. Click **Import Project** → select `AuroraHealth`
4. Framework preset: **Vite** (should auto-detect)
5. Click **Deploy**

You'll get a URL like `aurora-health.vercel.app` — shareable immediately.

### Option B: Netlify (also free)

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com), sign in with GitHub
3. **New site from Git** → select `AuroraHealth`
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Click **Deploy**

### Option C: GitHub Pages

```bash
npm run build
# deploy dist/ folder to gh-pages branch
npx gh-pages -d dist
```

Then enable Pages in your repo settings.

## Custom domain

Once deployed on Vercel or Netlify, you can add a custom domain (e.g. `aurorahealth.app`) through their dashboard. Both support free SSL.

## PWA — installable on phones

This is a Progressive Web App. When users visit the link on mobile:
- **Android**: Chrome shows an "Add to Home Screen" prompt automatically
- **iOS**: Tap Share → "Add to Home Screen"

It will appear as a standalone app with your Aurora logo, dark splash screen, and no browser chrome.

## Live solar data

By default, the app uses sample data. To connect live data from the Australian Bureau of Meteorology Space Weather Services:

1. Request an API key at [sws.bom.gov.au](https://sws.bom.gov.au)
2. Enter it in Settings → Data Source within the app

> **Note:** The SWS API requires a proxy to avoid CORS issues in the browser. For production, set up a simple API route (e.g. on Vercel serverless functions) that proxies requests to `https://sws-data.sws.bom.gov.au/`.

## Roadmap to app stores

### Google Play (via Trusted Web Activity)

Once the PWA is live with a custom domain + SSL:
1. Use [Bubblewrap](https://github.com/nicothin/nicothin/nicothin/nicothin/nicothin) or [PWABuilder.com](https://pwabuilder.com) to wrap the PWA
2. Upload the generated `.aab` to Google Play Console
3. Cost: A$35 one-time developer registration

### Apple App Store (via Capacitor)

1. Install Capacitor: `npm install @capacitor/core @capacitor/ios`
2. `npx cap init` → `npx cap add ios`
3. Build and open in Xcode: `npm run build && npx cap sync && npx cap open ios`
4. Cost: A$149/year Apple Developer Program

## Tech stack

- **React 18** + **Vite 5** — fast dev and build
- **Lucide React** — consistent icon set
- **DM Sans** — clean, modern typography
- **vite-plugin-pwa** — service worker + manifest generation
- **WCAG AA compliant** — all text passes 4.5:1 contrast ratio

## License

MIT
