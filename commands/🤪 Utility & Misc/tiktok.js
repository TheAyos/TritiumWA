const TritiumCommand = require("../../models/TritiumCommand");
const axios = require("axios");
const fetch = require("node-fetch");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, args }) {
    const urlExp = new RegExp(
      "(http(s)?://.)?(www.)?[-a-zA-Z0-9@:%._+~#=]{2,256}.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)",
      "g",
    );
    const link = args[0];
    if (!link.match(urlExp) && !link.includes("tiktok.com"))
      return Tritium.reply(msg.from, "Doesn't seem like a valid URL. Try again !", msg.id);

    /* tiktok(link)
      .then(async (videoMeta) => {
        videoMeta = videoMeta.collector[0];
        const filename = videoMeta.authorMeta.name + ".mp4";
        const caps = `*Metadata:*\nUsername: ${videoMeta.authorMeta.name} \nMusic: ${
          videoMeta.musicMeta.musicName
        } \nViews: ${videoMeta.playCount.toLocaleString()} \nLikes: ${videoMeta.diggCount.toLocaleString()} \nComments: ${videoMeta.commentCount.toLocaleString()} \nShare: ${videoMeta.shareCount.toLocaleString()} \nCaption: ${
          videoMeta.text.trim() ? videoMeta.text : "-"
        }`;
        console.log(videoMeta);
        await Tritium.sendFileFromUrl(
          msg.from,
          videoMeta.videoUrl,
          filename,
          videoMeta.NoWaterMark ? caps : `a\n\n${caps}`,
          msg.id,
          { headers: { "User-Agent": "okhttp/4.5.0", referer: "https://www.tiktok.com/" } },
        ).catch((err) => console.error(err));
      })
      .catch(() => Tritium.reply(msg.from, "The given link is invalid 😿", msg.id));*/

    const fetch = require("node-fetch");

    Tritium.reply(msg.from, "Liking the video to download it faster...", msg.id);
    const tkt = await axios.get(`http://videfikri.com/api/tiktok/?url=${link}`);
    if (!tkt.data.result)
      return Tritium.reply(msg.from, "😿 The video is unavailable rn, try later !", msg.id);
    const res = await fetch(tkt.data.result.link);
    const buff = await res.buffer();
    await Tritium.sendFile(
      msg.from,
      `data:video/mp4;base64,${buff.toString("base64")}`,
      `tiktok.mp4`,
      "",
      msg.id,
    );
  },
  {
    triggers: ["tiktok", "tkt"],
    description: "Download a TikTok video.",
    usage: "{command} [URL]",

    minArgs: 1,
    groupOnly: true,
    cooldown: 18,
  },
);
/*
const { getVideoMeta } = require("tiktok-scraper");

const tiktok = (url) =>
  new Promise((resolve, reject) => {
    console.log("Get metadata from =>", url);
    getVideoMeta(url, { noWaterMark: true, hdVideo: true })
      .then(async (result) => {
        console.log(
          "Get Video From",
          "@" + result.collector[0].authorMeta.name,
          "ID:",
          result.collector[0].id,
        );
        if (result.collector[0].videoUrlNoWaterMark) {
          result.collector[0].url = result.collector[0].videoUrlNoWaterMark;
          result.collector[0].NoWaterMark = true;
        } else {
          result.collector[0].url = result.collector[0].videoUrl;
          result.collector[0].NoWaterMark = false;
        }
        resolve(result);
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
*/
