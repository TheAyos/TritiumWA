const TritiumCommand = require('../../models/TritiumCommand');

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, args, cleanArgs, chatPrefix }) {
        const supportedRE = new RegExp(/^en$|^fr$|^ar$|^de$|^it$|^ru$|^zh$|^ja$/);

        if (args.length < 2 || !args[0].match(supportedRE)) return await msg.reply(this.getHelpMsg(chatPrefix), true);

        const gtts = require('node-gtts')(args[0]);
        const wstream = new Tritium.WMStrm('data');

        gtts.stream(cleanArgs.substring(args[0].length))
            .pipe(wstream)
            .on('finish', async function () {
                console.log('finished writing');
                await Tritium.sendAudio(msg.from, `data:audio/mpeg;base64,${wstream._memStore.data.toString('base64')}`).catch();
                wstream.end();
            });
    },
    {
        triggers: ['tts', 'texttospeech', 'speech', 'say'],
        usage: '{command} [language] [text]',
        example: ['{command} en I am a robot', '{command} fr Je suis un robot'],
        description: 'Converts text to speech.\nSupported languages: *en, fr, ar, de, it, ru, zh, ja*',

        cooldown: 10,
        minArgs: 2,
        groupOnly: true,
    },
);
