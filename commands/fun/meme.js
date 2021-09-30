const TritiumCommand = require('../../models/TritiumCommand');

const fetch = require('node-fetch');

module.exports = new TritiumCommand(
    async function ({ Tritium, msg }) {
        const url = 'http://meme-api.herokuapp.com/gimme/';
        const res = await fetch(url, { method: 'Get' });
        const json = await res.json();

        if (!json.url) return await Tritium.reply(msg.from, 'error: ' + json.message, msg.id);
        await Tritium.sendFileFromUrl(msg.from, json.url, json.url.split('/').pop(), json.title);
    },
    {
        triggers: ['meme'],
        usage: ['{command}'],
        example: ['{command}'],
        description: 'Send an ePiC meme from Reddit!',

        cooldown: 10,
        groupOnly: true,
    },
);
