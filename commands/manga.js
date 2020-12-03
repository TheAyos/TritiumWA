exports.name = 'manga'

exports.desc = 'Send manga info according to search.';
exports.usage = `.prefix${this.name} [search]`;
exports.example = `.prefix${this.name} One Piece`;

exports.needArgs = true;

exports.run = async function (client, message, args) {

    const request = require('request');
    const { jikan } = client.utils;
    let query = args.join(' ');

    try {
        client.reply(message.from, '_J\'y travaille..._', message.id);
        console.log('[Command request] (manga) ' + query);
        request({
            url: jikan + 'search/manga?q=' + query + '&limit=1',
            json: true
        }, async (error, response) => {

            if (error) return console.error(error);
            let result = response.body.results[0];
            if (result == undefined)
                return client.reply(message.from, `*Manga not found !*`, message.id);
            if (result.volumes === 0) result.volumes = 'Unknown';
            //client.sendStickerfromUrl(message.from, result.image_url);

            let caption = "*_Manga found !_*\n\n" +
                "*✨ Title : " + result.title + "*\n\n" +
                "*_⚜️ Publishing :_* " + result.publishing + "\n" +
                "*❤️ Score :* " + result.score + " | " +
                "*🌟 Volumes :* " + result.volumes + "\n\n" +
                "*🌠 Synopsis :* " + result.synopsis + "\n\n" +
                "*🌍 URL:*\n" + result.url;

            client.sendFileFromUrl(message.from, result.image_url, result.image_url.split('/').pop(), caption, message.id);
        });
    } catch (error) {
        console.log(error);
    }
}