const { WMStrm } = require("./misc");

const ytdl = require("ytdl-core");
const ytsr = require("youtube-sr");

class YoutubeFunctions {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated!`);
    }

    static isYTVideoLink(query) {
        return ytsr.YouTube.validate(query, "VIDEO") || ytsr.YouTube.validate(query, "VIDEO_ID");
    }
    static isYTPlaylistLink(query) {
        query = query.split("&list").shift(); // should allow playing single video coming from a playlist
        return ytsr.YouTube.validate(query, "PLAYLIST") || ytsr.YouTube.validate(query, "PLAYLIST_ID");
    }

    static searchTracks(query, limit = 1) {
        return new Promise((resolve) => {
            let tracks = [];
            ytsr.YouTube.search(query, { type: "video", limit })
                .then((results) => {
                    if (results.length > 0) {
                        tracks = results.map((r) => r);
                    }
                    if (tracks.length === 0) return null;
                    return resolve(tracks);
                })
                .catch((error) => error);
        });
    }

    static searchTrack(query, firstOnly = false) {
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
                .catch((error) => error);
        });
    }

    static async getTrackFromVideoLink(link) {
        const videoData = await ytdl.getBasicInfo(link).catch((error) => {
            console.log(error);
            return null;
        });
        if(!videoData) return null;
        const highestQualityThumbnailIndex = videoData.videoDetails.thumbnails.length - 1;
        const parsedData = {
            title: videoData.videoDetails.title,
            id: videoData.videoDetails.videoId,
            url: videoData.videoDetails.video_url,
            views: videoData.videoDetails.viewCount,
            thumbnail: videoData.videoDetails.thumbnails[highestQualityThumbnailIndex],
            lengthSeconds: videoData.videoDetails.lengthSeconds,
            isLiveContent: videoData.videoDetails.isLiveContent,
            description: videoData.videoDetails.description,
            author: { name: videoData.videoDetails.author.name },
            channel: {
                name: videoData.videoDetails.author.name,
                subscribers: videoData.videoDetails.author.subscriber_count,
            },
            likes: videoData.videoDetails.likes,
            dislikes: videoData.videoDetails.dislikes,
        };
        // if (!trackData.channel) trackData.channel = { name: trackData.author.name };
        /* let parsedData2 = parsedData;
        parsedData2.description = "coupéy";
        console.log(parsedData2);*/
        return parsedData;
    }

    static async getData64Track(link) {
        const videoReadableStream = ytdl(link, { filter: "audioonly", quality: "lowest" });
        const randomName = Math.random().toString(36).substring(7);
        const wstream = new WMStrm(randomName);
        const stream = videoReadableStream.pipe(wstream);

        const end = new Promise(function (resolve, reject) {
            stream.on("finish", () => resolve());
            stream.on("error", reject);
        }).catch((e) => e);
        await end;

        const data64Track = `data:audio/mpeg;base64,${wstream._memStore[randomName].toString("base64")}`;
        wstream.end();
        return data64Track;
    }
}

module.exports = YoutubeFunctions;

/* Original getData64Track() code
const videoReadableStream = ytdl(trackToPlay.url, { filter: "audioonly", quality: "lowest" });
const name = Math.random().toString(36).slice(7);
const wstream = new Tritium.WMStrm(name);
const stream = await videoReadableStream.pipe(wstream);

stream.on("finish", async () => {
    await Tritium.sendPtt(msg.from, `data:audio/mpeg;base64,${wstream._memStore[name].toString("base64")}`).catch((error) => {
        console.log(error);
        return Tritium.reply(msg.from, "Error mp3 :( ", msg.id);
    });
    wstream.end();
}); */
