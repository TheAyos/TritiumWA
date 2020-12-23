exports.name = 'anime'

exports.desc = 'Send anime info according to search.';
exports.usage = `.prefix${this.name} [search]`;
exports.example = `.prefix${this.name} Doctor Stone`;

exports.needArgs = true;

exports.run = async function (client, message, args) {

    const fetch = require('node-fetch');
    const { jikan } = client.utils;
    let query = args.join(' ');

    try {
        client.simulateTyping(message.from, true);
        console.log('[Command request] (anime) ' + query);

        let url = jikan + 'search/anime?q=' + query + '&limit=1';
        let settings = { method: "Get" };

        fetch(url, settings)
            .then(res => res.json())
            .then(async (body, error) => {
                if (error) return console.log(error);
                let result = body.results[0];
                if (result == undefined)
                    return client.reply(message.from, '*Anime not found !*', message.id);

                let caption = "*_Anime found !_*\n\n" +
                    "*✨ Title : " + result.title + "*\n\n" +
                    "*_⚜️ Type :_* " + result.type + "\n" +
                    "*❤️ Score :* " + result.score + " | " +
                    "*🌟 Episodes :* " + result.episodes + "\n\n" +
                    "*🌠 Synopsis :* " + result.synopsis + "\n\n" +
                    "*🌍 URL:*\n" + result.url;

                client.simulateTyping(message.from, false);
                await client.sendFileFromUrl(message.from, result.image_url, result.image_url.split('/').pop(), caption);
            });
    } catch (error) {
        client.simulateTyping(message.from, false);
        console.log(error);
    }
}