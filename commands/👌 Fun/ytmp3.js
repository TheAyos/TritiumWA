module.exports = {
    triggers: ["ytmp3"],
    usage: "{command} [URL]\n",
    example:
        "{command} https://www.youtube.com/watch?v=QH2-TGUlwu4\n" +
        "{command} https://m.youtube.com/watch?v=QH2-TGUlwu4\n" +
        "{command} https://youtu.be/QH2-TGUlwu4",
    description: "Send audio from a youtube video.",

    isNSFW: false,
    needArgs: true,
    cooldown: 15,

    run: async function (client, message, args) {
        const ytdl = require("ytdl-core");
        const WMStrm = client.utils.WMStrm;

        let isLink = args[0].match(
            /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
        );

        if (!isLink) return client.reply(message.from, "C'est pô un lien valide ça !", message.id);

        try {
            client.simulateTyping(message.from, true);
            let videoURL = args[0].toString();
            var videoInfo = await ytdl.getInfo(videoURL);
            var videoTitle = videoInfo.videoDetails.title.replace("|", "").toString("ascii");

            if (videoInfo.videoDetails.lengthSeconds > 5 * 60) {
                client.simulateTyping(message.from, false);
                return client.reply(
                    message.from,
                    "*La vidéo est trop longue (>5 min) !*\n_Ne t'inquiètes pas, c'est ce qu'elles disent toutes ;)_",
                    message.id,
                );
            }

            await client
                .sendFileFromUrl(
                    message.from,
                    videoInfo.videoDetails.thumbnails[2].url,
                    "./temp/thumb.jpg",
                    `➸ *Titre* : ${videoTitle}\n\n◌ Le fichier arrive 🦅 !`,
                )
                .catch(() => {
                    client.simulateTyping(message.from, false);
                    client.reply(message.from, "Erreur image :( ");
                });

            var videoReadableStream = ytdl(videoURL, { filter: "audioonly", quality: "lowest" });

            // need a queue system & then i can use id file caching
            //var tempFile = `./temp/${message.chat.id}_${videoInfo.videoDetails.videoId}.mp3`;
            //var videoWritableStream = fs.createWriteStream(tempFile);
            //var stream = videoReadableStream.pipe(videoWritableStream);

            var wstream = new WMStrm("data");
            var stream = await videoReadableStream.pipe(wstream);

            stream.on("finish", async function () {
                console.log("finished writing");
                client.simulateTyping(message.from, false);
                await client
                    .sendAudio(
                        message.from,
                        `data:audio/mpeg;base64,${wstream._memStore.data.toString("base64")}`,
                    )
                    .catch(
                        (e) =>
                            client.reply(message.from, "Erreur mp3 :( ", message.id) &&
                            console.log(e),
                    );
                wstream.end();
            });

            /*stream.on('finish', async function () {
                await client.sendAudio(message.from, stream)
                    .catch(() => client.reply(message.from, 'Erreur mp3 :( ', message.id));
            });*/
        } catch (error) {
            client.simulateTyping(message.from, false);
            client.reply(message.from, "*Erreur!* Le lien n'est sûrement pas valide !", message.id);
            console.log(client.utils.moment().format("H:mm:ss") + " *Erreur!* ytmp3 --> " + error);
        }
    },
};
