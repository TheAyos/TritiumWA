const TritiumCommand = require('../../models/TritiumCommand');
const TextUtils = require('../../utils/TextUtils');

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, cleanArgs }) {
        await Tritium.reply(msg.from, TextUtils.firework(cleanArgs), msg.id);
    },
    {
        triggers: ['firework'],
        description: 'I҉g҉n҉i҉t҉e҉ your text !',
        usage: '{command} [some_text]',

        minArgs: 1,
    },
);
