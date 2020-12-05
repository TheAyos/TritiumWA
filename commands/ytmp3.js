exports.name = 'ytmp3';

exports.desc = 'Send audio from a youtube video.';
exports.usage = `.prefix${this.name} [URL]`;
exports.example = `.prefix${this.name} https://www.youtube.com/watch?v=QH2-TGUlwu4\n` +
    `.prefix${this.name} https://m.youtube.com/watch?v=QH2-TGUlwu4\n` +
    `.prefix${this.name} https://youtu.be/QH2-TGUlwu4`;

exports.needArgs = true;

exports.run = async function (client, message, args) {

    const ytdl = require('ytdl-core');
    const fs = require('fs');

    // managed by handler
    //if (args.length !== 1) return client.reply(message.from, '*dibile! c\'est /ytmp3 [URL]*')
    let isLink = args[0].match(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/)

    if (!isLink) return client.reply(message.from, 'C\'est pô un lien valide ça !', message.id)

    try {
        client.reply(message.from, '_J\'y travaille..._', message.id);
        let videoURL = args[0].toString();
        var videoInfo = (await ytdl.getInfo(videoURL))
        var videoTitle = videoInfo.videoDetails.title.replace('|', '').toString('ascii');

        if (videoInfo.videoDetails.lengthSeconds > 5 * 60) return client.reply(message.from, '*La vidéo est trop longue (>5 min) !*\n_Ne t\'inquiètes pas, c\'est ce qu\'elles disent toutes ;)_', message.id)

        await client.sendFileFromUrl(message.from, videoInfo.videoDetails.thumbnail.thumbnails[2].url,
            './temp/thumb.jpg', `➸ *Titre* : ${videoTitle}\n\n◌ Le fichier arrive 🦅 !`)
            .catch(() => client.reply(message.from, 'Erreur image :( '));

        var videoReadableStream = ytdl(videoURL, { filter: 'audioonly', quality: 'lowest' });

        // need a queue system & then i can use id file caching
        var tempFile = `./temp/${message.chat.id}_${videoInfo.videoDetails.videoId}.mp3`;
        var videoWritableStream = fs.createWriteStream(tempFile);
        var stream = videoReadableStream.pipe(videoWritableStream);

        stream.on('finish', async function () {
            await client.sendAudio(message.from, tempFile)
                .catch(() => client.reply(message.from, 'Erreur mp3 :( ', message.id));
        });

    } catch (error) {
        client.reply(message.from, '*Erreur!* Le lien n\'est sûrement pas valide !', message.id)
        console.log(client.utils.moment().format("H:mm:ss") + ' *Erreur!* Le lien n\'est sûrement pas valide !' + error)
    }
}