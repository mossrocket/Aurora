// Removes a Web Push subscription from Upstash Redis.

import { Redis } from "@upstash/redis";

const SUBS_KEY = "push:subs";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const endpoint = body.endpoint;
    if (typeof endpoint !== "string" || !endpoint) {
      return res.status(400).json({ error: "Missing endpoint" });
    }

    const redis = Redis.fromEnv();
    await redis.hdel(SUBS_KEY, endpoint);

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to remove subscription" });
  }
}
