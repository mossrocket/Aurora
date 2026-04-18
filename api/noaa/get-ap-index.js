// Running a-index (24-hour equivalent) from NOAA SWPC.
// NOAA's planetary-k-index.json includes an "a_running" field — a 24-hour
// running equivalent-amplitude value that corresponds to the daily Ap.
//
// Response shape matches the former BOM proxy:
//   { data: [{ index: N, valid_time: "...", ... }] }

const NOAA_URL =
  "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";

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
    const rawA = Number(latest.a_running);
    if (!Number.isFinite(rawA)) {
      return res.status(502).json({ error: "Missing a_running value in NOAA response" });
    }

    const payload = {
      data: [
        {
          index: Math.max(0, Math.round(rawA)),
          valid_time: normaliseTime(latest.time_tag),
          analysis_time: new Date().toISOString().replace("T", " ").slice(0, 19),
          source: "NOAA SWPC running 24-hour a-index",
        },
      ],
    };

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=1800");
    return res.status(200).json(payload);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch A-index from NOAA SWPC" });
  }
}
