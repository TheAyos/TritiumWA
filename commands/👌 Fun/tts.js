module.exports = {
    triggers: ["tts", "texttospeech", "speech", "say"],
    usage: "{command} [language] [text]",
    example: "{command} en I am a robot\n" + "{command} fr Je suis un robot",
    description: "Converts text to speech.\nSupported languages: *en, fr, ar*",

    isNSFW: false,
    needArgs: true,
    cooldown: 10,

    run: async function (client, message, args, cleanArgs) {
        const msg = message,
            Tritium = client;
        const supportedRE = new RegExp(/^en$|^fr$|^ar$/);

        if (args.length < 2 || !args[0].match(supportedRE))
            return Tritium.helpThisPoorMan(Tritium, msg, ["tts"]);

        const gtts = require("node-gtts")(args[0]);

        Tritium.simulateTyping(msg.from, true);
        const WMStrm = Tritium.utils.WMStrm;
        var wstream = new WMStrm("data");

        gtts.stream(cleanArgs.substring(args[0].length))
            .pipe(wstream)
            .on("finish", async function () {
                console.log("finished writing");
                Tritium.simulateTyping(msg.from, false);
                await Tritium.sendAudio(
                    msg.from,
                    `data:audio/mpeg;base64,${wstream._memStore.data.toString("base64")}`,
                ).catch((e) => {
                    Tritium.simulateTyping(msg.from, false);
                    Tritium.reply(msg.from, "Erreur mp3 :( ", msg.id);
                    console.log(e);
                });
                wstream.end();
            });
    },
};
