// Scheduled job: checks NOAA planetary Kp and, when activity crosses up into
// "elevated" territory since the last run, sends a generic Web Push alert to all
// stored subscriptions. Triggered by Vercel Cron (see vercel.json) or any caller
// presenting the CRON_SECRET.
//
// Privacy: the alert is generic and identical for everyone — no personal data
// (conditions, sensitivity) is stored or used here. The app applies the user's
// personal sensitivity locally when they open it.

import { Redis } from "@upstash/redis";
import webpush from "web-push";

const NOAA_URL = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";
const SUBS_KEY = "push:subs";
const LAST_KP_KEY = "push:lastKp";

function authorised(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured → allow (e.g. local dev)
  const auth = req.headers["authorization"] || "";
  if (auth === `Bearer ${secret}`) return true; // Vercel Cron sends this header
  const url = new URL(req.url, "http://localhost");
  return url.searchParams.get("secret") === secret; // manual trigger fallback
}

export default async function handler(req, res) {
  if (!authorised(req)) return res.status(401).json({ error: "Unauthorised" });

  const threshold = Number(process.env.KP_ALERT_THRESHOLD) || 5; // NOAA G1 (minor storm)

  try {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return res.status(500).json({ error: "VAPID keys not configured" });
    }
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:peteragray@gmail.com",
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const noaa = await fetch(NOAA_URL, {
      headers: { "User-Agent": "aurora-health (github.com/mossrocket/Aurora)" },
    });
    if (!noaa.ok) return res.status(502).json({ error: "NOAA request failed", status: noaa.status });
    const rows = await noaa.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(502).json({ error: "Unexpected NOAA response" });
    }
    const latest = rows[rows.length - 1];
    const kp = Math.max(0, Math.min(9, Math.round(Number(latest.Kp))));
    if (!Number.isFinite(kp)) return res.status(502).json({ error: "Missing Kp value" });

    const redis = Redis.fromEnv();
    const lastRaw = await redis.get(LAST_KP_KEY);
    const last = Number(lastRaw);
    await redis.set(LAST_KP_KEY, kp);

    const crossedUp = Number.isFinite(last) && last < threshold && kp >= threshold;
    if (!crossedUp) {
      return res.status(200).json({ kp, last: Number.isFinite(last) ? last : null, threshold, sent: 0, note: "no upward crossing" });
    }

    const subsMap = (await redis.hgetall(SUBS_KEY)) || {};
    const entries = Object.entries(subsMap);
    const payload = JSON.stringify({
      title: "Aurora — solar activity rising",
      body: `Geomagnetic activity has risen to Kp ${kp}. Open Aurora to see how it may affect your tracked conditions.`,
      url: "/",
      tag: "aurora-kp-rising",
    });

    let sent = 0;
    let removed = 0;
    await Promise.all(
      entries.map(async ([endpoint, val]) => {
        let sub;
        try { sub = typeof val === "string" ? JSON.parse(val) : val; } catch { return; }
        try {
          await webpush.sendNotification(sub, payload);
          sent++;
        } catch (err) {
          if (err && (err.statusCode === 404 || err.statusCode === 410)) {
            await redis.hdel(SUBS_KEY, endpoint);
            removed++;
          }
        }
      })
    );

    return res.status(200).json({ kp, last, threshold, subscribers: entries.length, sent, removed });
  } catch (err) {
    return res.status(500).json({ error: "Cron failed", detail: String((err && err.message) || err) });
  }
}
