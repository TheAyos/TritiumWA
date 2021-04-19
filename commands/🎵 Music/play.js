const TritiumCommand = require("../../models/TritiumCommand");
const WMStrm = require("../../utils/WMStrm");

const ytdl = require("ytdl-core");
const ytsr = require("youtube-sr");

const TOO_LONG_TEXT = "*It's too long (>10 min) !*\n_don't worry that what she said..._";

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, cleanArgs: query }) {
    let trackToPlay;

    if (isYTPlaylistLink(query)) return Tritium.reply(msg.from, "The given link is a playlist !");

    if (isYTVideoLink(query)) {
      const videoData = await ytdl.getBasicInfo(query).catch((e) => {
        console.log(e);
        return Tritium.reply(msg.from, "Video unavaliable. Invalid link ? Retryyy !", msg.id);
      });
      if (videoData.videoDetails.isLiveContent) return Tritium.reply(msg.from, "Can't play a Live video !");
      // get highest quality thumbnail
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
    } else {
      trackToPlay = await searchTracks(query, true);

      if (!trackToPlay) return Tritium.reply(msg.from, "No results ! Invalid query. Retryyy !", msg.id);
      if (!trackToPlay.lengthSeconds) trackToPlay.lengthSeconds = +trackToPlay.duration / 1000;
    }

    if (trackToPlay.lengthSeconds > 10 * 60) return Tritium.reply(msg.from, TOO_LONG_TEXT, msg.id);

    await Tritium.sendFileFromUrl(
      msg.from,
      trackToPlay.thumbnail.url || trackToPlay.thumbnail,
      "thumb.jpg",
      `➸ *${trackToPlay.title}* by _*${trackToPlay.channel.name}*_`,
    ).catch((e) => {
      console.log(e);
      return Tritium.reply(msg.from, "error :( ");
    });

    const videoReadableStream = ytdl(trackToPlay.url, { filter: "audioonly", quality: "lowest" });

    const name = Math.random().toString(36).substring(7);

    const wstream = new WMStrm(name);
    const stream = await videoReadableStream.pipe(wstream);

    stream.on("finish", async function () {
      await Tritium.sendAudio(
        msg.from,
        `data:audio/mpeg;base64,${wstream._memStore[name].toString("base64")}`,
      ).catch((e) => {
        console.log(e);
        return Tritium.reply(msg.from, "Error mp3 :( ", msg.id);
      });
      wstream.end();
    });
  },
  {
    triggers: ["play", "p", "music"],
    usage: ["{command} [query]", "{command} [URL]"],
    example: ["{command} nyan cat", "{command} https://youtu.be/QH2-TGUlwu4"],
    description: "Play a music 🎶",

    cooldown: 20,
    minArgs: 1,
    groupOnly: true,
  },
);

function isYTVideoLink(query) {
  return ytsr.YouTube.validate(query, "VIDEO");
}
function isYTPlaylistLink(query) {
  return ytsr.YouTube.validate(query, "PLAYLIST");
}

function searchTracks(query, firstOnly = false) {
  return new Promise((resolve) => {
    let tracks = [];

    ytsr.YouTube.search(query, { type: "video" })
      .then((results) => {
        if (results.length !== 0) {
          tracks = results.map((r) => r);
        }

        if (tracks.length === 0) return null;

        if (firstOnly) return resolve(tracks[0]);

        return resolve(tracks);
      })
      .catch((e) => e);
  });
}
