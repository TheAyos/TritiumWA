const TritiumCommand = require("../../models/TritiumCommand");

const ytdl = require("ytdl-core");
const ytsr = require("youtube-sr");

const MAX_LENGTH_SECONDS = 10 * 60;

const TEXT_ERROR_LINK_IS_PLAYLIST = `The given link is a playlist !`;
const TEXT_ERROR_VIDEO_LINK = `Video unavaliable. Invalid link ? Retryyy !`;
const TEXT_ERROR_LIVE_VIDEO = `Can't play a Live video !`;
const TEXT_ERROR_VIDEO_QUERY = `No results ! Invalid query ? Retryyy !`;
const TEXT_ERROR_SENDING_THUMBNAIL = `I wasn't able to send you the thumbnail this time :(`;
const TEXT_ERROR_SENDING_AUDIO = `I wasn't able to send you the audio file this time :(`;
const TEXT_TOO_LONG = `*It's too long (>${MAX_LENGTH_SECONDS / 60} min) !*\n_don't worry that what she said..._`;

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, cleanArgs: query }) {
        let track;

        if (isYTPlaylistLink(query)) return Tritium.reply(msg.from, TEXT_ERROR_LINK_IS_PLAYLIST, msg.id);
        if (isYTVideoLink(query)) {
            track = await getTrackFromVideoLink(query);
            if (!track) return Tritium.reply(msg.from, TEXT_ERROR_VIDEO_LINK, msg.id);
            if (track.isLiveContent) return Tritium.reply(msg.from, TEXT_ERROR_LIVE_VIDEO, msg.id);
        } else {
            track = await searchTracks(query, true);
            if (!track) return Tritium.reply(msg.from, TEXT_ERROR_VIDEO_QUERY, msg.id);
            if (!track.lengthSeconds) track.lengthSeconds = +track.duration / 1000;
        }
        if (track.lengthSeconds > MAX_LENGTH_SECONDS) return Tritium.reply(msg.from, TEXT_TOO_LONG, msg.id);

        const caption = `➸ *${track.title}* by _*${track.channel.name}*_`;
        await Tritium.sendFileFromUrl(msg.from, track.thumbnail.url, "thumb.jpg", caption).catch((error) => {
            console.log(error);
            return Tritium.reply(msg.from, TEXT_ERROR_SENDING_THUMBNAIL, msg.id);
        });

        const videoReadableStream = ytdl(track.url, { filter: "audioonly", quality: "lowest" });
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

function isYTVideoLink(query) {
    return ytsr.YouTube.validate(query, "VIDEO") || ytsr.YouTube.validate(query, "VIDEO_ID");
}
function isYTPlaylistLink(query) {
    return ytsr.YouTube.validate(query, "PLAYLIST") || ytsr.YouTube.validate(query, "PLAYLIST_ID");
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

async function getTrackFromVideoLink(link) {
    let trackData;
    trackData = await ytdl.getBasicInfo(link).catch((error) => {
        console.log(error);
        return null;
    });
    const highestQualityThumbnailIndex = trackData.videoDetails.thumbnails.length - 1;
    trackData = {
        title: trackData.videoDetails.title,
        url: trackData.videoDetails.video_url,
        views: trackData.videoDetails.viewCount,
        thumbnail: trackData.videoDetails.thumbnails[highestQualityThumbnailIndex],
        lengthSeconds: trackData.videoDetails.lengthSeconds,
        isLiveContent: trackData.videoDetails.isLiveContent,
        description: trackData.videoDetails.description,
        author: { name: trackData.videoDetails.author.name },
        channel: { name: trackData.videoDetails.author.name },
    };
    console.log(trackData);
    // if (!trackData.channel) trackData.channel = { name: trackData.author.name };
    return trackData;
}
