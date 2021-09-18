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

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, cleanArgs: query }) {
        let track;

        if (YT.isYTPlaylistLink(query)) return Tritium.reply(msg.from, TEXT_ERROR_LINK_IS_PLAYLIST, msg.id);
        if (YT.isYTVideoLink(query)) {
            track = await YT.getTrackFromVideoLink(query);
            if (!track) return Tritium.reply(msg.from, TEXT_ERROR_VIDEO_LINK, msg.id);
            if (track.isLiveContent) return Tritium.reply(msg.from, TEXT_ERROR_LIVE_VIDEO, msg.id);
        } else {
            track = await YT.searchTrack(query, true);
            if (!track) return Tritium.reply(msg.from, TEXT_ERROR_VIDEO_QUERY, msg.id);
            if (!track.lengthSeconds) track.lengthSeconds = +track.duration / 1000; // TODO investigate ??
        }
        if (track.lengthSeconds > MAX_LENGTH_SECONDS) return Tritium.reply(msg.from, TEXT_TOO_LONG, msg.id);

        try {
            const caption = `➸ *${track.title}* by _*${track.channel.name}*_`;
            await Tritium.sendFileFromUrl(msg.from, track.thumbnail.url, "thumb.jpg", caption).catch((e) => e);
        } catch (error) {
            Tritium.error(error);
            return Tritium.reply(msg.from, TEXT_ERROR_SENDING_INFO_CARD, msg.id);
        }

        const videoReadableStream = require("ytdl-core")(track.url, { filter: "audioonly", quality: "lowest" });
        const randomName = Math.random().toString(36).substring(7);
        const wstream = new Tritium.WMStrm(randomName);
        const stream = await videoReadableStream.pipe(wstream);
        stream.on("finish", async () => {
            const data64Audio = `data:audio/mpeg;base64,${wstream._memStore[randomName].toString("base64")}`;
            await Tritium.sendPtt(msg.from, data64Audio).catch((error) => {
                console.log(error);
                return Tritium.reply(msg.from, TEXT_ERROR_SENDING_AUDIO, msg.id);
            });
            wstream.end();
        });

        /* try {
            const data64Audio = await YT.getData64Track(track.url).catch((e) => e);
            await Tritium.sendPtt(msg.from, data64Audio).catch((e) => e);
        } catch (error) {
            Tritium.error(error);
            return Tritium.reply(msg.from, TEXT_ERROR_SENDING_AUDIO, msg.id);
        }*/
    },
    {
        triggers: ["play", "p", "music", "song"],
        usage: ["{command} [query]", "{command} [URL]"],
        example: ["{command} nyan cat", "{command} https://youtu.be/QH2-TGUlwu4"],
        description: "Play music 🎶",

        cooldown: 20,
        minArgs: 1,
        groupOnly: true,
    },
);
