const TritiumCommand = require("@models/TritiumCommand");

module.exports = new TritiumCommand(
  async ({ Tritium, msg, args }) => {
    const ytdl = require("ytdl-core");
    const WMStrm = Tritium.utils.WMStrm;

    const isLink = args[0].match(
      /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
    );

    if (!isLink) return Tritium.reply(msg.from, "C'est pô un lien valide ça !", msg.id);

    try {
      let videoURL = args[0].toString();
      var videoInfo = await ytdl.getInfo(videoURL);
      var videoTitle = videoInfo.videoDetails.title.replace("|", "").toString("ascii");

      if (videoInfo.videoDetails.lengthSeconds > 5 * 60) {
        return Tritium.reply(
          msg.from,
          "*La vidéo est trop longue (>5 min) !*\n_Ne t'inquiètes pas, c'est ce qu'elles disent toutes ;)_",
          msg.id,
        );
      }

      await Tritium.sendFileFromUrl(
        msg.from,
        videoInfo.videoDetails.thumbnails[2].url,
        "thumb.jpg",
        `➸ *Titre* : ${videoTitle}\n\n◌ Le fichier arrive 🦅 !`,
      ).catch(() => {
        Tritium.reply(msg.from, "Erreur image :( ");
      });

      var videoReadableStream = ytdl(videoURL, { filter: "audioonly", quality: "lowest" });

      // need a queue system & then i can use id file caching
      //var tempFile = `./temp/${msg.chat.id}_${videoInfo.videoDetails.videoId}.mp3`;
      //var videoWritableStream = fs.createWriteStream(tempFile);
      //var stream = videoReadableStream.pipe(videoWritableStream);

      var wstream = new WMStrm("data");
      var stream = await videoReadableStream.pipe(wstream);

      stream.on("finish", async function () {
        console.log("finished writing");
        await Tritium.sendAudio(
          msg.from,
          `data:audio/mpeg;base64,${wstream._memStore.data.toString("base64")}`,
        ).catch((e) => Tritium.reply(msg.from, "Erreur mp3 :( ", msg.id) && console.log(e));
        wstream.end();
      });
    } catch (error) {
      Tritium.reply(msg.from, "*Error!* That *_cursed_* link is probably not valid !", msg.id);
      Tritium.logger.error("ytmp3 --> " + error);
    }
  },
  {
    triggers: ["ytmp3"],
    usage: "{command} [URL]",
    example: [
      "{command} https://www.youtube.com/watch?v=QH2-TGUlwu4",
      "{command} https://m.youtube.com/watch?v=QH2-TGUlwu4",
      "{command} https://youtu.be/QH2-TGUlwu4",
    ],
    description: "Send audio from a youtube video.",

    cooldown: 15,
    minArgs: 1,
  },
);
