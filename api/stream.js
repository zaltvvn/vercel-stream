export default async function handler(req, res) {

  const ch = req.query.ch || "25";

  const iframeUrl = `https://www.adintrend.tv/hd/live/i.php?ch=${ch}`;

  try {

    const r = await fetch(iframeUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": "https://www.adintrend.tv/",
        "Origin": "https://www.adintrend.tv"
      }
    });

    const html = await r.text();

    const match = html.match(/https?:\/\/[^"' ]+\.m3u8[^"' ]*/);

    if (!match) {
      res.status(404).send("m3u8 not found");
      return;
    }

    const m3u8 = match[0];

    const stream = await fetch(m3u8, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.adintrend.tv/"
      }
    });

    const playlist = await stream.text();

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.send(playlist);

  } catch (err) {

    res.status(500).send(err.toString());

  }

}