export default async function handler(req, res) {

  const ch = req.query.ch || "25";

  try {

    // IP client
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "8.8.8.8";

    // 1. load trang channel
    const page = await fetch(`https://www.adintrend.tv/hd/ch${ch}?t=live`, {
      headers:{
        "User-Agent":"Mozilla/5.0",
        "Referer":"https://www.adintrend.tv/"
      }
    });

    const html = await page.text();

    // 2. lấy cxid
    const cxidMatch = html.match(/cxid=([a-zA-Z0-9]+)/);

    if(!cxidMatch){
      res.status(500).send("cxid not found");
      return;
    }

    const cxid = cxidMatch[1];

    // 3. tạo dtime
    const now = new Date();

    const dtime =
      String(now.getDate()).padStart(2,'0') + "-" +
      String(now.getMonth()+1).padStart(2,'0') + "-" +
      now.getFullYear() + "-" +
      now.getHours() + ":" +
      now.getMinutes();

    // 4. gọi iframe player
    const iframeUrl =
      `https://www.adintrend.tv/hd/live/i.php?ch=${ch}` +
      `&cxid=${cxid}` +
      `&tmpx=${ip}` +
      `&ccc=VN` +
      `&device=desktop` +
      `&dtime=${dtime}` +
      `&platform=Win32` +
      `&touch=0`;

    const player = await fetch(iframeUrl,{
      headers:{
        "User-Agent":"Mozilla/5.0",
        "Referer":`https://www.adintrend.tv/hd/ch${ch}?t=live`
      }
    });

    const playerHtml = await player.text();

    // 5. tìm link m3u8
    const m3u8Match = playerHtml.match(/https?:\/\/[^"' ]+\.m3u8[^"' ]*/);

    if(!m3u8Match){
      res.status(500).send("m3u8 not found");
      return;
    }

    const m3u8 = m3u8Match[0];

    // 6. redirect tới m3u8
    res.writeHead(302,{
      Location: m3u8
    });

    res.end();

  } catch(e){
    res.status(500).send(e.toString());
  }

}
