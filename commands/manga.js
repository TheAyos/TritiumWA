const request = require('request');
const moment = require('moment-timezone');

module.exports = {
    name: 'manga',
    desc: '',
    async run(client, message, args, command) {

        // if args contain sticker pop and send stick
        // send help on no args

        const { jikan } = client.utils;
        let query = args.join(' ');
        try {
            if (!args.length) return client.reply(message.from,
                `*Command: ${module.name}*\n\n` +
                '*Description:* ```Send Manga info according to search.```\n' +
                '*Remind:* ```Don\'t use [] or <> in commands.```\n' +
                '*Usage*\n' +
                ` ${client.prefix}${command} [search]\n` +
                //` ${client.prefix}${command} [search] sticker _(with a sticker :D)_\n` +
                '*Example*\n' +
                ` ${client.prefix}${command} One Piece` +

                `\n\n*🤖 Tritium • ${moment().format("HH:mm")}*`
                , message.id);
            client.reply(message.from, '_J\'y travaille..._', message.id);
            console.log('[Command request] (manga) ' + query);
            request({
                url: jikan + 'search/manga?q=' + query + '&limit=1',
                json: true
            }, async (error, response) => {

                if (error) return console.error(error);
                let result = response.body.results[0];
                if (result == undefined)
                    return client.reply(message.from, `_[${client.prefix}${command}]_ *Manga not found !*`, message.id);
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
}