const TritiumCommand = require('../../models/TritiumCommand');
const TextUtils = require('../../utils/TextUtils');

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, cleanArgs }) {
        await Tritium.reply(msg.from, TextUtils.frame(cleanArgs), msg.id);
    },
    {
        triggers: ['frametext'],
        description: '*Puts your text between brackets:【Perfect for framing your text】*',
        usage: '{command} [some_text]',

        minArgs: 1,
    },
);
