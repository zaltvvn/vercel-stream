export default async function handler(req, res) {

  const ch = req.query.ch || "25";

  try {

    // STEP 1: load trang channel
    const page = await fetch(`https://www.adintrend.tv/hd/ch${ch}?t=live`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.adintrend.tv/"
      }
    });

    const html = await page.text();

    // STEP 2: lấy link iframe i.php
    const iframeMatch = html.match(/https:\/\/www\.adintrend\.tv\/hd\/live\/i\.php[^"]+/);

    if (!iframeMatch) {
      res.status(500).send("iframe not found");
      return;
    }

    const iframeUrl = iframeMatch[0];

    // STEP 3: load iframe player
    const player = await fetch(iframeUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.adintrend.tv/"
      }
    });

    const playerHtml = await player.text();

    // STEP 4: tìm m3u8
    const m3u8Match = playerHtml.match(/https?:\/\/[^"' ]+\.m3u8[^"' ]*/);

    if (!m3u8Match) {
      res.status(500).send("stream not found");
      return;
    }

    const m3u8 = m3u8Match[0];

    // STEP 5: proxy playlist
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

  } catch (e) {

    res.status(500).send(e.toString());

  }

}
