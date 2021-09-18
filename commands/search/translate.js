const TritiumCommand = require('../../models/TritiumCommand');

const fetch = require('node-fetch');

module.exports = new TritiumCommand(
    async ({ Tritium, msg, args, cleanArgs }) => {
        let text;
        const target = args[0];

        if (args.length >= 1 && !msg._quotedMsg) {
            args.shift();
            if (!args.length) return Tritium.reply(msg.from, "You didn't give any text !", msg.id);
            text = args.join(' ');
        } else if (args.length >= 1 && msg._quotedMsg) {
            text = msg._quotedMsg && msg._quotedMsg.isMedia ? msg.quotedMsgObj.caption : msg._quotedMsg ? msg._quotedMsg.body : '';
            if (!text) return Tritium.reply(msg.from, 'Quoted message has no text !', msg.id);
        }

        const translatedText = await Trenatlas(text, target);
        if (!translatedText) return Tritium.reply(msg.from, 'Error. Check if you are using a correct language code !', msg.id);

        return Tritium.reply(msg.from, `${translatedText}`, msg.id);
    },
    {
        triggers: ['translate', 'trt', 'trad'],
        description: 'Translate a quoted message or given text.',
        usage: ['{command} [language code] (with quoted message)', '{command} [language code] [text]'],

        groupOnly: true,
        minArgs: 1,
        cooldown: 10,
    },
);

async function Trenatlas(sourceText, target = 'en', source = 'auto') {
    if (!target || !target.length) target = 'en';
    if (!source || !source.length) source = 'auto';

    const text = sourceText.replace(/\*/g, '').replace(/\_/g, '').replace(/\`/g, '');
    const url = `https://script.google.com/macros/s/AKfycbwzT4rDHQrzxjbuPQHIfDrc4EKdhSV5OUkBSZI9BFGTG2Qsusggm-KQ/exec?q=` + `${encodeURIComponent(text)}&source=${source}&target=${target}`;

    let result;
    let tries = 0;
    do {
        const res = await fetch(url, { method: 'Get' });
        result = await res.json().catch((e) => {
            result = undefined;
            if (!e.message.includes('json')) console.error(e.message);
        });
    } while (!result && tries++ <= 5);

    return result ? result.translatedText : '';
}
