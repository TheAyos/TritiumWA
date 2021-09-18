const TritiumCommand = require('../../models/TritiumCommand');
const TextUtils = require('../../utils/TextUtils');

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, args, cleanArgs }) {
        if (args[0] === 'double') {
            args.shift();
            await Tritium.reply(msg.from, TextUtils.underline(args.join(' '), true), msg.id);
        } else await Tritium.reply(msg.from, TextUtils.underline(cleanArgs), msg.id);
    },
    {
        triggers: ['underline', 'ul'],
        description: 'U̳n̳d̳e̳r̳l̳i̳n̳e̳ ̳t̳h̳a̳t̳ ̳!',
        usage: ['{command} [s̲o̲m̲e̲ ̲t̲e̲x̲t̲]', '{command} double [s̳o̳m̳e̳ ̳t̳e̳x̳t̳]'],

        minArgs: 1,
    },
);
