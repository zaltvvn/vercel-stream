export default async function handler(req, res) {

  const ch = req.query.ch || "25";

  try {

    // 1. load trang kênh
    const page = await fetch(`https://www.adintrend.tv/hd/ch${ch}?t=live`, {
      headers:{
        "User-Agent":"Mozilla/5.0",
        "Referer":"https://www.adintrend.tv/"
      }
    });

    const html = await page.text();

    // 2. tìm iframe
    const iframe = html.match(/https:\/\/www\.adintrend\.tv\/hd\/live\/i\.php[^"]+/);

    if(!iframe){
      res.status(500).send("iframe not found");
      return;
    }

    // 3. load player
    const player = await fetch(iframe[0],{
      headers:{
        "User-Agent":"Mozilla/5.0",
        "Referer":"https://www.adintrend.tv/"
      }
    });

    const playerHtml = await player.text();

    // 4. tìm m3u8
    const m3u8 = playerHtml.match(/https?:\/\/[^"' ]+\.m3u8[^"' ]*/);

    if(!m3u8){
      res.status(500).send("stream not found");
      return;
    }

    // 5. load playlist
    const playlist = await fetch(m3u8[0],{
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
