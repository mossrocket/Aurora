// Planetary Kp nowcast from NOAA SWPC.
// Returns the most recent estimated 3-hour planetary Kp (0–9 integer scale),
// rounded from NOAA's fractional value. No API key required.
//
// NOAA response: [{ time_tag, Kp, a_running, station_count }, ...] ordered oldest→newest.
// Response shape matches the former BOM proxy:
//   { data: [{ index: <0..9>, valid_time: "YYYY-MM-DD HH:MM:SS", ... }] }

const NOAA_URL =
  "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";

// Convert NOAA's ISO time ("2026-04-18T18:00:00") to the legacy space-separated form
// the frontend already knows how to slice ("2026-04-18 18:00:00").
function normaliseTime(t) {
  return typeof t === "string" ? t.replace("T", " ") : t;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const response = await fetch(NOAA_URL, {
      headers: { "User-Agent": "aurora-health (github.com/mossrocket/Aurora)" },
    });

    if (!response.ok) {
      return res
        .status(502)
        .json({ error: "Upstream NOAA SWPC request failed", status: response.status });
    }

    const rows = await response.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(502).json({ error: "Unexpected NOAA SWPC response shape" });
    }

    const latest = rows[rows.length - 1];
    const rawKp = Number(latest.Kp);
    if (!Number.isFinite(rawKp)) {
      return res.status(502).json({ error: "Missing Kp value in NOAA response" });
    }

    const rounded = Math.max(0, Math.min(9, Math.round(rawKp)));

    const payload = {
      data: [
        {
          index: rounded,
          raw_kp: rawKp,
          valid_time: normaliseTime(latest.time_tag),
          analysis_time: new Date().toISOString().replace("T", " ").slice(0, 19),
          station_count: latest.station_count,
          source: "NOAA SWPC planetary Kp (estimated)",
        },
      ],
    };

    // NOAA updates every minute; Kp changes every 3 hours. Cache 5 min at the edge,
    // serve stale for 30 min while revalidating.
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=1800");
    return res.status(200).json(payload);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch Kp from NOAA SWPC" });
  }
}
