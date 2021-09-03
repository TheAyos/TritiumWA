const TritiumCommand = require("@models/TritiumCommand");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, args }) {
    const ytdl = require("ytdl-core");
    const WMStrm = Tritium.utils.WMStrm;

    const isYtLink = args[0].match(
      /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
    );

    if (!isYtLink) return Tritium.reply(msg.from, "That's not a valid link !", msg.id);

    try {
      let videoURL = args[0].toString();
      var videoInfo = await ytdl.getInfo(videoURL);
      var videoTitle = videoInfo.videoDetails.title.replace("|", "").toString("ascii");

      if (videoInfo.videoDetails.lengthSeconds > 5 * 60) {
        return Tritium.reply(
          msg.from,
          "*It's too long (>10 min) !*\n_don't worry that what she said..._",
          msg.id,
        );
      }

      await Tritium.sendFileFromUrl(
        msg.from,
        videoInfo.videoDetails.thumbnails[2].url,
        "thumb.jpg",
        `➸ *Title* : ${videoTitle}\n\n◌ File is coming 🦅 !`,
      ).catch(() => {
        Tritium.reply(msg.from, "error :( ");
      });

      var videoReadableStream = ytdl(videoURL, { filter: "audioonly", quality: "lowest" });

      var wstream = new WMStrm("data");
      var stream = await videoReadableStream.pipe(wstream);

      stream.on("finish", async function () {
        console.log("finished writing");
        await Tritium.sendAudio(
          msg.from,
          `data:audio/mpeg;base64,${wstream._memStore.data.toString("base64")}`,
        ).catch((e) => Tritium.reply(msg.from, "error mp3 :( ", msg.id) && console.log(e));
        wstream.end();
      });
    } catch (error) {
      Tritium.reply(msg.from, "*Error!* That *_cursed_* link is probably not valid !", msg.id);
      Tritium.logger.error("ytmp3 --> " + error);
    }
  },
  {
    triggers: ["ytmp3", "mp3"],
    usage: "{command} [URL]",
    example: [
      "{command} https://www.youtube.com/watch?v=QH2-TGUlwu4",
      "{command} https://m.youtube.com/watch?v=QH2-TGUlwu4",
      "{command} https://youtu.be/QH2-TGUlwu4",
    ],
    description: "Send audio from a youtube video.",

    cooldown: 20,
    minArgs: 1,
  },
);
