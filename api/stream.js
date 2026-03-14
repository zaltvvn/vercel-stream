export default async function handler(req, res) {

  const ch = req.query.ch || "25";

  try {

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      "8.8.8.8";

    // load channel page
    const page = await fetch(`https://www.adintrend.tv/hd/ch${ch}?t=live`, {
      headers:{
        "User-Agent":"Mozilla/5.0",
        "Referer":"https://www.adintrend.tv/"
      }
    });

    const html = await page.text();

    const cxidMatch = html.match(/cxid=([a-zA-Z0-9]+)/);

    if(!cxidMatch){
      res.status(500).send("cxid not found");
      return;
    }

    const cxid = cxidMatch[1];

    const now = new Date();
    const dtime =
      String(now.getDate()).padStart(2,'0') + "-" +
      String(now.getMonth()+1).padStart(2,'0') + "-" +
      now.getFullYear() + "-" +
      now.getHours() + ":" +
      now.getMinutes();

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

    const m3u8Match = playerHtml.match(/https?:\/\/[^"' ]+\.m3u8[^"' ]*/);

    if(!m3u8Match){
      res.status(500).send("m3u8 not found");
      return;
    }

    const m3u8 = m3u8Match[0];

    // proxy playlist
    const playlist = await fetch(m3u8,{
      headers:{
        "Origin":"https://www.adintrend.tv",
        "Referer":"https://www.adintrend.tv/",
        "User-Agent":"Mozilla/5.0"
      }
    });

    const text = await playlist.text();

    res.setHeader("Content-Type","application/vnd.apple.mpegurl");
    res.setHeader("Access-Control-Allow-Origin","*");

    res.send(text);

  } catch(e){
    res.status(500).send(e.toString());
  }

}
