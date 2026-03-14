
export default async function handler(req, res) {

  const ch = req.query.ch || "25";

  try {

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "8.8.8.8";

    /* 1. load trang channel */
    const page = await fetch(`https://www.adintrend.tv/hd/ch${ch}?t=live`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.adintrend.tv/"
      }
    });

    const html = await page.text();

    const cxid = html.match(/cxid=([a-zA-Z0-9]+)/)?.[1];

    if (!cxid) {
      res.status(500).send("cxid not found");
      return;
    }

    /* 2. tạo dtime */
    const now = new Date();
    const dtime =
      String(now.getDate()).padStart(2, "0") + "-" +
      String(now.getMonth() + 1).padStart(2, "0") + "-" +
      now.getFullYear() + "-" +
      now.getHours() + ":" +
      now.getMinutes();

    /* 3. gọi iframe player */
    const iframeUrl =
      `https://www.adintrend.tv/hd/live/i.php?ch=${ch}` +
      `&cxid=${cxid}` +
      `&tmpx=${ip}` +
      `&ccc=VN` +
      `&device=desktop` +
      `&dtime=${dtime}` +
      `&platform=Win32` +
      `&touch=0`;

    const player = await fetch(iframeUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": `https://www.adintrend.tv/hd/ch${ch}?t=live`
      }
    });

    const playerHtml = await player.text();

    const m3u8 = playerHtml.match(/https?:\/\/[^"' ]+\.m3u8[^"' ]*/)?.[0];

    if (!m3u8) {
      res.status(500).send("m3u8 not found");
      return;
    }

    /* 4. tải playlist thật */
    const playlist = await fetch(m3u8, {
      headers: {
        "Origin": "https://www.adintrend.tv",
        "Referer": "https://www.adintrend.tv/",
        "User-Agent": "Mozilla/5.0"
      }
    });

    let text = await playlist.text();

    /* 5. rewrite segment */
    const base = m3u8.substring(0, m3u8.lastIndexOf("/") + 1);

    text = text.replace(/(.*\.ts.*)/g, base + "$1");

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.send(text);

  } catch (e) {
    res.status(500).send(e.toString());
  }
}
