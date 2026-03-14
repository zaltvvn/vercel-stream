export default async function handler(req, res) {

  const ch = req.query.ch || "25";

  try {

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
      `&tmpx=14.242.182.130` +
      `&ccc=VN` +
      `&device=desktop` +
      `&dtime=${dtime}` +
      `&platform=Win32` +
      `&touch=0`;

    const player = await fetch(iframeUrl,{
      headers:{
        "User-Agent":"Mozilla/5.0",
        "Referer":"https://www.adintrend.tv/"
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

    // 6. tải playlist
    const playlist = await fetch(m3u8,{
      headers:{
        "User-Agent":"Mozilla/5.0",
        "Referer":"https://www.adintrend.tv/"
      }
    });

    const text = await playlist.text();

    res.status(200);
    res.setHeader("Content-Type","application/vnd.apple.mpegurl");
    res.setHeader("Access-Control-Allow-Origin","*");
    res.send(text);

  } catch(e){
    res.status(500).send(e.toString());
  }

}
