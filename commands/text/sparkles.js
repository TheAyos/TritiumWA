const TritiumCommand = require('../../models/TritiumCommand');
const TextUtils = require('../../utils/TextUtils');

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, cleanArgs }) {
        await Tritium.reply(msg.from, TextUtils.sparkles(cleanArgs), msg.id);
    },
    {
        triggers: ['sparkles'],
        description: 'Make your text ˜”*°•.˜”*°• _*sparkly*_ •°*”˜.•°*”˜',
        usage: '{command} [some_text]',

        minArgs: 1,
    },
);
