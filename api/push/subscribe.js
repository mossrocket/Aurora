// Stores a Web Push subscription in Upstash Redis.
// Subscriptions are anonymous (an endpoint URL + keys) — no personal data.
// Stored in a hash keyed by endpoint so re-subscribing is idempotent.

import { Redis } from "@upstash/redis";

const SUBS_KEY = "push:subs";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const sub = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    if (!sub || typeof sub.endpoint !== "string" || !sub.endpoint) {
      return res.status(400).json({ error: "Invalid subscription" });
    }

    const redis = Redis.fromEnv();
    await redis.hset(SUBS_KEY, { [sub.endpoint]: JSON.stringify(sub) });

    return res.status(201).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to store subscription" });
  }
}
