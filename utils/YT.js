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
        return ytsr.YouTube.validate(query, "PLAYLIST") || ytsr.YouTube.validate(query, "PLAYLIST_ID");
    }

    static searchTracks(query, firstOnly = false) {
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

    /* static async getData64Track(link) {
        let data64Track;
        const videoReadableStream = ytdl(link, { filter: "audioonly", quality: "lowest" });
        const randomName = Math.random().toString(36).substring(7);
        const wstream = new WMStrm(randomName);
        const stream = await videoReadableStream.pipe(wstream);
        stream.on("finish", async () => {
            data64Track = `data:audio/mpeg;base64,${wstream._memStore[randomName].toString("base64")}`;
            wstream.end();
        });
        console.log(data64Track);
        return data64Track;
    }*/

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
