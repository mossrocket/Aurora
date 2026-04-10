const SWS_BASE = "https://sws-data.sws.bom.gov.au/api/v1";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const apiKey =
      req.body?.api_key ||
      req.query?.api_key ||
      process.env.SWS_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: "No API key provided. Set SWS_API_KEY in Vercel environment variables or pass api_key in the request." });
    }

    const response = await fetch(`${SWS_BASE}/get-a-index`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({
        api_key: apiKey,
        options: { location: "Australian region" },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch A-index from SWS API" });
  }
}
