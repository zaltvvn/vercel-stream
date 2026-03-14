export default async function handler(req, res) {

  const ch = req.query.ch || "25";

  try {

    const page = await fetch(
      `https://www.adintrend.tv/hd/ch${ch}?t=live`,
      { headers:{ "User-Agent":"Mozilla/5.0" } }
    );

    const html = await page.text();

    const cxid = html.match(/cxid=([a-zA-Z0-9]+)/)?.[1];

    if(!cxid){
      res.status(500).send("cxid not found");
      return;
    }

    const iframe = await fetch(
      `https://www.adintrend.tv/hd/live/i.php?ch=${ch}&cxid=${cxid}`,
      {
        headers:{
          "User-Agent":"Mozilla/5.0",
          "Referer":`https://www.adintrend.tv/hd/ch${ch}?t=live`
        }
      }
    );

    const body = await iframe.text();

    const m3u8 = body.match(/https:\/\/[^"]+\.m3u8[^"]*/)?.[0];

    if(!m3u8){
      res.status(500).send("m3u8 not found");
      return;
    }

    // redirect tới stream thật
    res.writeHead(302,{
      Location: m3u8
    });

    res.end();

  } catch(e){
    res.status(500).send(e.toString());
  }

}
