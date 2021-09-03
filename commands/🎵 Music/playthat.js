const TritiumCommand = require("../../models/TritiumCommand");

const ytdl = require("ytdl-core");
const ytsr = require("youtube-sr");

const TOO_LONG_TEXT = "*It's too long (>11 min) !*\n_don't worry that what she said..._";

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, chatPrefix }) {
    let trackToPlay;

    // TODO: msg.QUOTEDMSG_PARSED_BODY
    let quotedMsg;
    if (msg.quotedMsg) {
      quotedMsg =
        msg.quotedMsg.type === "chat"
          ? msg.quotedMsg.body
          : msg.quotedMsg.type === "image" || msg.quotedMsg.type === "video"
          ? msg.quotedMsg.caption
          : undefined;
    } else {
      quotedMsg =
        msg.quotedMsgObj.type === "chat"
          ? msg.quotedMsgObj.body
          : msg.quotedMsgObj.type === "image" || msg.quotedMsgObj.type === "video"
          ? msg.quotedMsgObj.caption
          : undefined;
    }

    const parsedUrl = quotedMsg ? quotedMsg.split("\n").shift() : undefined;
    console.log(parsedUrl);

    if (!parsedUrl || !isYTVideoLink(parsedUrl))
      return await Tritium.reply(
        msg.from,
        `Unable to parse quoted message ! Are you sure it comes from the \`\`\`${chatPrefix}youtube\`\`\` command ?`,
        msg.id,
      );

    // should not get that from .youtube though
    // if (isYTPlaylistLink(parsedUrl)) return await Tritium.reply(msg.from, "The link is a playlist !");

    if (isYTVideoLink(parsedUrl)) {
      const videoData = await ytdl.getBasicInfo(parsedUrl).catch((e) => {
        console.log(e);
        return Tritium.reply(msg.from, "Video unavaliable. Invalid link ? Retryyy !", msg.id);
      });
      if (videoData.videoDetails.isLiveContent) return Tritium.reply(msg.from, "Can't play a Live video !");

      const lastThumbnail = videoData.videoDetails.thumbnails.length - 1;
      trackToPlay = {
        title: videoData.videoDetails.title,
        url: videoData.videoDetails.video_url,
        views: videoData.videoDetails.viewCount,
        thumbnail: videoData.videoDetails.thumbnails[lastThumbnail],
        lengthSeconds: videoData.videoDetails.lengthSeconds,
        description: videoData.videoDetails.description,
        author: {
          name: videoData.videoDetails.author.name,
        },
      };
      if (!trackToPlay.channel) trackToPlay.channel = { name: trackToPlay.author.name };
    }

    if (trackToPlay.lengthSeconds > 11 * 60) return Tritium.reply(msg.from, TOO_LONG_TEXT, msg.id);

    // TODO: try promise.all to start working on audio while sending image !

    /* await Tritium.sendFileFromUrl(
      msg.from,
      trackToPlay.thumbnail.url,
      "thumb.jpg",
      `➸ *${trackToPlay.title}* by _*${trackToPlay.channel.name}*_`,
      msg.id,
    ).catch((e) => {
      console.log(e);
      return Tritium.reply(msg.from, "error :( ");
    }); */

    await Tritium.reply(msg.from, `➸ *${trackToPlay.title}* by _*${trackToPlay.channel.name}*_`, msg.id).catch((e) => {
      console.log(e);
      return Tritium.reply(msg.from, "error :( ");
    });

    const videoReadableStream = ytdl(trackToPlay.url, { filter: "audioonly", quality: "lowest" });

    const name = Math.random().toString(36).substring(7);

    const wstream = new Tritium.WMStrm(name);
    const stream = await videoReadableStream.pipe(wstream);

    stream.on("finish", async function () {
      await Tritium.sendAudio(msg.from, `data:audio/mpeg;base64,${wstream._memStore[name].toString("base64")}`).catch(
        (e) => {
          console.log(e);
          return Tritium.reply(msg.from, "Error mp3 :( ", msg.id);
        },
      );
      wstream.end();
    });
  },
  {
    triggers: ["playthat"],
    usage: ["{command} (with a quoted message from ```{prefix}youtube```)"],
    example: ["{command} (with a quoted message from ```{prefix}youtube```)"],
    description: "Play a music 🎶, to be used in conjunction with the ```{prefix}youtube``` command.",

    cooldown: 20,
    minArgs: "quotedMsg",
    groupOnly: true,
  },
);

function isYTVideoLink(query) {
  return ytsr.YouTube.validate(query, "VIDEO");
}
