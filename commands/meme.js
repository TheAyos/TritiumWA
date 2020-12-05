exports.name = 'meme'

exports.desc = 'Send an ePiC meme from Reddit!'
exports.usage = `.prefix${this.name}\n` +
    `.prefix${this.name} [subreddit]`;
exports.example = `.prefix${this.name} cursed_comments`;

exports.needArgs = false;

exports.run = async function (client, message, args) {

    const fetch = require('node-fetch');

    let query = '';
    if (args.length === 1) query = args.pop();
    else if (args.length > 1) return client.commands.get('help').run(client, message, this.name);

    try {
        let url = 'http://meme-api.herokuapp.com/gimme/' + query;
        let settings = { method: "Get" };

        fetch(url, settings)
            .then(res => res.json())
            .then(async (body, error) => {
                if (error || !body.url) return client.reply(message.from, 'error: ' + body.message, message.id);
                else if (body.nsfw == true && message.isGroupMsg) return client.reply(message.from, '🔞NSFW available only in dms 😏', message.id);
                else await client.sendFileFromUrl(message.from, body.url, body.url.split('/').pop(), body.title);
            });
    } catch (error) {
        console.log(error);
    }
}