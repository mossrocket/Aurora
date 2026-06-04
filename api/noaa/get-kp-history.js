// 7-day planetary Kp history from NOAA SWPC.
// Returns the daily MAXIMUM estimated 3-hour planetary Kp for each of the last
// 7 calendar days (UTC), so the app can show a "past week" strip alongside the
// 3-day forecast. No API key required.
//
// NOAA response: [{ time_tag, Kp, a_running, station_count }, ...] oldest→newest.
// Response shape:
//   { data: [{ date: "YYYY-MM-DD", index: <0..9> }, ...] }  (ascending by date)

const NOAA_URL =
  "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";

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

    // Group by calendar day (UTC), keeping the max Kp seen that day.
    const byDay = {};
    rows.forEach((row) => {
      const t = typeof row.time_tag === "string" ? row.time_tag : "";
      const day = t.slice(0, 10);
      if (!day) return;
      const rawKp = Number(row.Kp);
      if (!Number.isFinite(rawKp)) return;
      const kp = Math.max(0, Math.min(9, Math.round(rawKp)));
      if (byDay[day] === undefined || kp > byDay[day]) byDay[day] = kp;
    });

    const data = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, index]) => ({ date, index }));

    const payload = {
      data,
      source: "NOAA SWPC planetary Kp (estimated) — daily maximum",
      fetched_at: new Date().toISOString(),
    };

    // Kp changes every 3 hours; 15 min edge cache, serve stale for an hour.
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
    return res.status(200).json(payload);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch Kp history from NOAA SWPC" });
  }
}
