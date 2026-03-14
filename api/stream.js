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
    const cxid = html.match(/cxid=([a-zA-Z0-9]+)/);

    if(!cxid){
      res.json({error:"cxid not found"});
      return;
    }

    // 3. tạo time giống site
    const now = new Date();
    const dtime =
      String(now.getDate()).padStart(2,'0') + "-" +
      String(now.getMonth()+1).padStart(2,'0') + "-" +
      now.getFullYear() + "-" +
      now.getHours() + ":" +
      now.getMinutes();

    // 4. gọi iframe
    const iframeUrl =
      `https://www.adintrend.tv/hd/live/i.php?ch=${ch}` +
      `&cxid=${cxid[1]}` +
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

    // 5. tìm m3u8
    const m3u8 = playerHtml.match(/https?:\/\/[^"' ]+\.m3u8[^"' ]*/);

    if(!m3u8){
      res.json({
        error:"stream not found",
        iframe:iframeUrl
      });
      return;
    }

    res.json({
      channel:ch,
      stream:m3u8[0]
    });

  } catch(e){
    res.json({error:e.toString()});
  }

}
