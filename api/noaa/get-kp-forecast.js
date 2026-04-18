// 3-day planetary Kp forecast from NOAA SWPC.
// Returns predicted 3-hour Kp values so the app can show "tomorrow afternoon
// may be elevated" style guidance.
//
// NOAA response: [{ time_tag, kp, observed, noaa_scale }, ...]
//   observed === "observed"  → historical reading
//   observed === "predicted" → forecast row (we only return these)
//
// Response shape:
//   { data: [{ index: N, valid_time: "...", is_forecast: true, noaa_scale: "G1"|null }, ...] }

const NOAA_URL =
  "https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json";

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
    if (!Array.isArray(rows)) {
      return res.status(502).json({ error: "Unexpected NOAA SWPC response shape" });
    }

    const forecasts = rows
      .filter((row) => String(row.observed).toLowerCase() === "predicted")
      .map((row) => {
        const rawKp = Number(row.kp);
        return {
          index: Number.isFinite(rawKp)
            ? Math.max(0, Math.min(9, Math.round(rawKp)))
            : null,
          raw_kp: Number.isFinite(rawKp) ? rawKp : null,
          valid_time: normaliseTime(row.time_tag),
          is_forecast: true,
          noaa_scale: row.noaa_scale || null,
        };
      })
      .filter((r) => r.index !== null);

    const payload = {
      data: forecasts,
      source: "NOAA SWPC 3-day planetary Kp forecast",
      fetched_at: new Date().toISOString(),
    };

    // Forecast updates a few times per day — 30 min edge cache is plenty.
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
    return res.status(200).json(payload);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch Kp forecast from NOAA SWPC" });
  }
}
