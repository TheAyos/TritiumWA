const TritiumCommand = require("../../models/TritiumCommand");

const ytdl = require("ytdl-core");
const ytsr = require("youtube-sr");

module.exports = new TritiumCommand(
  async ({ Tritium, msg, cleanArgs: query, chatPrefix }) => {
    let videoResults;
    let trackToPlay;

    if (isYTPlaylistLink(query)) {
      return Tritium.reply(msg.from, "The given link is a playlist !");
    }

    if (isYTVideoLink(query)) {
      const videoData = await ytdl.getInfo(query).catch((error) => {
        console.log(error);
        return Tritium.reply(msg.from, "Video unavaliable. Invalid link ? Retryyy !", msg.id);
      });

      // See that later
      if (videoData.videoDetails.isLiveContent) {
        return Tritium.reply(msg.from, "Can't play a Live video !");
      }

      // Good parsing ++
      const lastThumbnail = videoData.videoDetails.thumbnails.length - 1;
      trackToPlay = {
        title: videoData.videoDetails.title,
        id: videoData.videoDetails.videoId,
        url: videoData.videoDetails.video_url,
        views: videoData.videoDetails.viewCount,
        thumbnail: videoData.videoDetails.thumbnails[lastThumbnail],
        lengthSeconds: videoData.videoDetails.lengthSeconds,
        description: videoData.videoDetails.description,
        channel: {
          name: videoData.videoDetails.author.name,
          subscribers: videoData.videoDetails.author.subscriber_count,
        },
        likes: videoData.videoDetails.likes,
        dislikes: videoData.videoDetails.dislikes,
      };

      let caption =
        `https://youtu.be/${trackToPlay.id}\n\n` +
        `*Title ➸* *${trackToPlay.title}*\n\n` +
        `⌚ *Duration ➵* *${Tritium.secondsToFormattedString(trackToPlay.lengthSeconds)}*\n` +
        `👁️ *Views ➵* *${Tritium.viewFormatter(trackToPlay.views)}*\n` +
        "📈 *Rating ➵* " +
        `*👍 ${Tritium.viewFormatter(trackToPlay.likes)} / 👎 ${Tritium.viewFormatter(trackToPlay.dislikes)}*\n` +
        `📺 *Channel ➵* *${trackToPlay.channel.name}*\n` +
        `🤺 *Subscribers ➵* *${Tritium.viewFormatter(trackToPlay.channel.subscribers)}*\n` +
        `📝 *Description ➵* ${trackToPlay.description.limit(69 + 45).replace(/(\n+)/g, "\n")}\n`;
      caption += `\nTo play the video, use \`\`\`${chatPrefix + "playthat"}\`\`\``;
      caption += Tritium.getSignature();

      await Tritium.sendFileFromUrl(msg.from, trackToPlay.thumbnail.url, "thumb.jpg", caption).catch(async (error) => {
        console.log(error);
        return await Tritium.reply(msg.from, "error :( ");
      });
    } else {
      videoResults = await searchTracks(query, 5);
      // Console.log(videoResults);
      console.log(Tritium.cColor(videoResults.length, "yellow"), "videos found");
      // If (!trackToPlay) return Tritium.reply(msg.from, "No results ! Invalid query. Retryyy !", msg.id);
      // if (!trackToPlay.lengthSeconds) trackToPlay.lengthSeconds = +trackToPlay.duration / 1000;

      let caption = "* * * *Youtube search results:* * * *\n";
      caption += `     * * * Showing *_(${videoResults.length})_* videos * * *\n\n`;
      for (const video of videoResults) {
        caption +=
          `${videoResults.indexOf(video) + 1}) *${video.title.limit(33)}*\n` +
          `➸ _https://youtu.be/${video.id}_\n` +
          `_*${Tritium.viewFormatter(video.views)}*_ *views* | by _*${video.channel.name}*_\n\n`;
      }

      caption += "To directly play a result, reply to this\n message with ```play [result number]```\n";
      caption += "For more info, reply to this message with\n the chosen result number ```(i.e.) 5```";
      caption += Tritium.getSignature();

      const listenID = await Tritium.sendText(msg.from, caption, msg.id, { withoutPreview: true });

      const filter = function (collected) {
        // Console.log("filtering...");
        // console.log(collected.quotedMsgObj.id.replace(/((true|false)_)/gi, ""));
        // console.log(collected.quotedMsg.id.replace(/((true|false)_)/gi, ""));
        // console.log(listenID.replace(/((true|false)_)/gi, ""));
        return (
          collected.sender.id === msg.sender.id &&
          collected.chat.id === msg.chat.id &&
          (collected.quotedMsgObj.id === listenID || collected.quotedMsg.id === listenID)
        );
      };

      /*const collector = new MessageCollector(
        await Tritium.getSessionId(),
        await Tritium.getInstanceId(),
        msg.chat.id,
        filter,
        { time: 20000, max: 1 },
      );*/
      const collector = Tritium.createMessageCollector(msg.chat.id, filter, { time: 20000, max: 1, dispose: true });

      collector.on("collect", async (collected) => {
        if (collected.body.toLowerCase().startsWith("play")) {
          const number = Number.parseInt(collected.body.replace(/play/i, "").trim());

          if (isNaN(number)) {
            return await Tritium.reply(collected.from, "You didn't give me a number !", collected.id);
          }
          if (number < 1 || number > 5) {
            return await Tritium.reply(collected.from, "The number is out of range !", collected.id);
          }

          const videoData = await ytdl.getBasicInfo(videoResults[number - 1].id).catch((error) => {
            console.log(error);
            return Tritium.reply(msg.from, "Video unavaliable. Invalid link ? Retryyy !", msg.id);
          });

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
          if (!trackToPlay.channel) {
            trackToPlay.channel = { name: trackToPlay.author.name };
          }

          await Tritium.reply(msg.from, `➸ *${trackToPlay.title}* by _*${trackToPlay.channel.name}*_`, msg.id).catch(
            (error) => {
              console.log(error);
              return Tritium.reply(msg.from, "error :( ");
            },
          );

          const videoReadableStream = ytdl(trackToPlay.url, { filter: "audioonly", quality: "lowest" });
          const name = Math.random().toString(36).slice(7);
          const wstream = new Tritium.WMStrm(name);
          const stream = await videoReadableStream.pipe(wstream);

          stream.on("finish", async () => {
            await Tritium.sendPtt(
              msg.from,
              `data:audio/mpeg;base64,${wstream._memStore[name].toString("base64")}`,
            ).catch((error) => {
              console.log(error);
              return Tritium.reply(msg.from, "Error mp3 :( ", msg.id);
            });
            wstream.end();
          });
          return true;
        }

        const number = Number.parseInt(collected.body);

        if (isNaN(number)) {
          return await Tritium.reply(collected.from, "You didn't give me a number !", collected.id);
        }
        if (number < 1 || number > 5) {
          return await Tritium.reply(collected.from, "The number is out of range !", collected.id);
        }

        const videoData = await ytdl.getInfo(videoResults[number - 1].id).catch((error) => {
          console.log(error);
          return Tritium.reply(msg.from, "Video unavaliable. Invalid link ? Retryyy !", msg.id);
        });

        const lastThumbnail = videoData.videoDetails.thumbnails.length - 1;
        trackToPlay = {
          title: videoData.videoDetails.title,
          id: videoData.videoDetails.videoId,
          url: videoData.videoDetails.video_url,
          views: videoData.videoDetails.viewCount,

          thumbnail: videoData.videoDetails.thumbnails[lastThumbnail],
          lengthSeconds: videoData.videoDetails.lengthSeconds,
          description: videoData.videoDetails.description,
          channel: {
            name: videoData.videoDetails.author.name,
            subscribers: videoData.videoDetails.author.subscriber_count,
          },
          likes: videoData.videoDetails.likes,
          dislikes: videoData.videoDetails.dislikes,
        };

        let caption0 =
          `https://youtu.be/${trackToPlay.id}\n\n` +
          `*Title ➸* *${trackToPlay.title}*\n\n` +
          `⌚ *Duration ➵* *${Tritium.secondsToFormattedString(trackToPlay.lengthSeconds)}*\n` +
          `👁️ *Views ➵* *${Tritium.viewFormatter(trackToPlay.views)}*\n` +
          "📈 *Rating ➵* " +
          `*👍 ${Tritium.viewFormatter(trackToPlay.likes)} / 👎 ${Tritium.viewFormatter(trackToPlay.dislikes)}*\n` +
          `📺 *Channel ➵* *${trackToPlay.channel.name}*\n` +
          `🤺 *Subscribers ➵* *${Tritium.viewFormatter(trackToPlay.channel.subscribers)}*\n` +
          `📝 *Description ➵* ${trackToPlay.description.limit(69 + 45).replace(/(\n+)/g, "\n")}\n`;
        caption0 += `\nTo play the video, use \`\`\`${chatPrefix + "playthat"}\`\`\``;
        caption0 += Tritium.getSignature();

        await Tritium.sendFileFromUrl(msg.from, trackToPlay.thumbnail.url, "thumb.jpg", caption0).catch(async (error) => {
          console.log(error);
          return await Tritium.reply(msg.from, "error :( ");
        });
      });
    }
  },
  {
    triggers: ["youtube", "ytsearch", "yt", "yts"],
    usage: ["{command} [query]", "{command} [URL]"],
    example: ["{command} urss anthem", "{command} https://www.youtube.com/watch?v=ZSLnkyPSlEM ;)"],
    description: "Search for a video on YouTube ⏯️",

    cooldown: 15,
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

function searchTracks(query, limit = 1) {
  return new Promise((resolve) => {
    let tracks = [];

    ytsr.YouTube.search(query, { type: "video", limit })
      .then((results) => {
        if (results.length > 0) {
          tracks = results.map((r) => r);
        }

        if (tracks.length === 0) {
          return null;
        }

        return resolve(tracks);
      })
      .catch((error) => error);
  });
}
