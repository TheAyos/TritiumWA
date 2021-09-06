const TritiumCommand = require("../../models/TritiumCommand");
const YT = require("../../utils/YT");

const MAX_LENGTH_SECONDS = 10 * 60;

const TEXT_ERROR_LINK_IS_PLAYLIST = `The given link is a playlist !`;
const TEXT_ERROR_VIDEO_LINK = `Video unavaliable. Invalid link ? Retryyy !`;
const TEXT_ERROR_LIVE_VIDEO = `Can't play a Live video !`;
const TEXT_ERROR_VIDEO_QUERY = `No results ! Invalid query ? Retryyy !`;
const TEXT_ERROR_SENDING_INFO_CARD = `I wasn't able to send you this video's info card :(`;
const TEXT_ERROR_SENDING_AUDIO = `I wasn't able to send you the audio track :(`;
const TEXT_TOO_LONG = `*It's too long (>${MAX_LENGTH_SECONDS / 60} min) !*\n_don't worry that what she said..._`;

const TEXT_INPUT_NO_SUPPLIED_NUMBER = `You didn't give me a number !`;
const TEXT_INPUT_SUPPLIED_NUMBER_OUT_OF_RANGE = `The supplied number is out of range !`;

module.exports = new TritiumCommand(
    async ({ Tritium, msg, cleanArgs: query, chatPrefix }) => {
        let videoResults;
        let track;

        if (YT.isYTPlaylistLink(query)) return Tritium.reply(msg.from, TEXT_ERROR_LINK_IS_PLAYLIST, msg.id);

        if (YT.isYTVideoLink(query)) {
            // *** If a video link is supplied, only send video info ***
            sendVideoInfoCard(Tritium, msg, query, chatPrefix);
        } else {
            // *** If a query is given, send search results and wait to eventually collect an answer for a track to play ***

            videoResults = await YT.searchTracks(query, 5);
            Tritium.log(`${videoResults.length} videos found in youtube.js | search mode`);
            if (videoResults.length < 1) return Tritium.reply(msg.from, TEXT_ERROR_VIDEO_QUERY, msg.id);

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

            // *** Message Collector for handling music requests directly from search results list ***
            const listenID = await Tritium.sendText(msg.from, caption, msg.id, { withoutPreview: true });
            const filter = function (collected) {
                return (
                    collected.sender.id === msg.sender.id &&
                    collected.chat.id === msg.chat.id &&
                    (collected.quotedMsg || collected.quotedMsgObj) &&
                    (collected.quotedMsg.id === listenID || collected.quotedMsgObj.id === listenID)
                );
            };
            const collector = Tritium.createMessageCollector(msg.chat.id, filter, { time: 20000, max: 1, dispose: true });

            collector.on("collect", async (collected) => {
                Tritium.log(`collected.body -> ${collected.body}`);
                if (collected.body.toLowerCase().startsWith("play")) {
                    const number = Number.parseInt(collected.body.replace(/play/i, "").trim());
                    if (isNaN(number)) return Tritium.reply(collected.from, TEXT_INPUT_NO_SUPPLIED_NUMBER, collected.id);
                    if (number < 1 || number > 5) return Tritium.reply(collected.from, TEXT_INPUT_SUPPLIED_NUMBER_OUT_OF_RANGE, collected.id);

                    const requestedVideoID = videoResults[number - 1].id;
                    track = await YT.getTrackFromVideoLink(requestedVideoID);
                    if (!track) return Tritium.reply(msg.from, TEXT_ERROR_VIDEO_LINK, msg.id);
                    if (track.lengthSeconds > MAX_LENGTH_SECONDS) return Tritium.reply(msg.from, TEXT_TOO_LONG, msg.id);

                    try {
                        await Tritium.reply(msg.from, `➸ *${track.title}* by _*${track.channel.name}*_`, msg.id).catch((e) => {
                            throw e;
                        });
                    } catch (error) {
                        Tritium.error(error);
                        return Tritium.reply(msg.from, TEXT_ERROR_SENDING_INFO_CARD, msg.id);
                    }

                    try {
                        const data64Audio = await YT.getData64Track(track.url).catch((e) => {
                            throw e;
                        });
                        await Tritium.sendPtt(msg.from, data64Audio).catch((e) => {
                            throw e;
                        });
                    } catch (error) {
                        Tritium.error(error);
                        return Tritium.reply(msg.from, TEXT_ERROR_SENDING_AUDIO, msg.id);
                    }
                }
                // *** Handle providing extra info from search results list directly ***

                const number = Number.parseInt(collected.body);

                if (isNaN(number)) return Tritium.reply(collected.from, TEXT_INPUT_NO_SUPPLIED_NUMBER, collected.id);
                if (number < 1 || number > 5) return Tritium.reply(collected.from, TEXT_INPUT_SUPPLIED_NUMBER_OUT_OF_RANGE, collected.id);

                const requestedVideoID = videoResults[number - 1].id;
                sendVideoInfoCard(Tritium, msg, requestedVideoID, chatPrefix);
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

async function sendVideoInfoCard(Tritium, msg, link, chatPrefix) {
    const track = await YT.getTrackFromVideoLink(link);
    if (!track) return Tritium.reply(msg.from, TEXT_ERROR_VIDEO_LINK, msg.id);
    if (track.isLiveContent) return Tritium.reply(msg.from, TEXT_ERROR_LIVE_VIDEO, msg.id);

    let caption =
        `https://youtu.be/${track.id}\n\n` +
        `*Title ➸* *${track.title}*\n\n` +
        `⌚ *Duration ➵* *${Tritium.secondsToFormattedString(track.lengthSeconds)}*\n` +
        `👁️ *Views ➵* *${Tritium.viewFormatter(track.views)}*\n` +
        "📈 *Rating ➵* " +
        `*👍 ${Tritium.viewFormatter(track.likes)} / 👎 ${Tritium.viewFormatter(track.dislikes)}*\n` +
        `📺 *Channel ➵* *${track.channel.name}*\n` +
        `🤺 *Subscribers ➵* *${Tritium.viewFormatter(track.channel.subscribers)}*\n` +
        `📝 *Description ➵* ${track.description.limit(69 + 45).replace(/(\n+)/g, "\n")}\n`;
    caption += `\nTo play the video, use \`\`\`${chatPrefix + "playthat"}\`\`\``;
    caption += Tritium.getSignature();

    try {
        await Tritium.sendFileFromUrl(msg.from, track.thumbnail.url, "thumb.jpg", caption);
    } catch (error) {
        Tritium.error(error);
        return Tritium.reply(msg.from, TEXT_ERROR_SENDING_INFO_CARD, msg.id);
    }
}
