const TritiumCommand = require('../../models/TritiumCommand');
const TextUtils = require('../../utils/TextUtils');

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, cleanArgs }) {
        await Tritium.reply(msg.from, TextUtils.flourish(cleanArgs), msg.id);
    },
    {
        triggers: ['flourish'],
        description: 'Emphasize your text in a ★·.·´¯`·.·★ fancy way ★·.·´¯`·.·★',
        usage: '{command} [some_text]',

        minArgs: 1,
    },
);
