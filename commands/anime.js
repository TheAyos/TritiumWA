const request = require('request');
const moment = require('moment');

exports.name = 'anime'
exports.desc = `*Command: ${this.name}*\n\n` +
    '*Description:* ```Send Anime info according to search.```\n' +
    '*Remind:* ```Don\'t use [] or <> in commands.```\n' +
    '*Usage*\n' +
    ` .prefix${this.name} [search]\n` +
    //` ${client.prefix}${command} [search] sticker _(with a sticker :D)_\n` +
    '*Example*\n' +
    ` .prefix${this.name} Doctor Stone`;
exports.needArgs = true;
exports.run = async function (client, message, args, command) {
    const { jikan } = client.utils;
    let query = args.join(' ');
    try {
        client.reply(message.from, '_J\'y travaille..._', message.id);
        console.log('[Command request] (anime) ' + query);
        request({
            url: jikan + 'search/anime?q=' + query + '&limit=1',
            json: true
        }, async (error, response) => {

            if (error) return console.error(error);
            let result = response.body.results[0];
            if (result == undefined)
                return client.reply(message.from, `_[${[client.prefix, command].join('')}]_ *Anime not found !*`, message.id);
            //client.sendStickerfromUrl(message.from, result.image_url);

            let caption = "*_Anime found !_*\n\n" +
                "*✨ Title : " + result.title + "*\n\n" +
                "*_⚜️ Type :_* " + result.type + "\n" +
                "*❤️ Score :* " + result.score + " | " +
                "*🌟 Episodes :* " + result.episodes + "\n\n" +
                "*🌠 Synopsis :* " + result.synopsis + "\n\n" +
                "*🌍 URL:*\n" + result.url;

            client.sendFileFromUrl(message.from, result.image_url, result.image_url.split('/').pop(), caption);
        });
    } catch (error) {
        console.log(error);
    }
}