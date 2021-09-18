const TritiumCommand = require("../../models/TritiumCommand");

module.exports = new TritiumCommand(
  async ({ Tritium, msg, args, cleanArgs }) => {
    const supportedRE = new RegExp(/^en$|^fr$|^ar$|^de$|^it$|^ru$|^zh$/);

    if (args.length < 2 || !args[0].match(supportedRE)) return await Tritium.helpThisPoorMan(msg, this);

    const gtts = require("node-gtts")(args[0]);

    const wstream = new Tritium.WMStrm("data");

    gtts
      .stream(cleanArgs.substring(args[0].length))
      .pipe(wstream)
      .on("finish", async function () {
        console.log("finished writing");
        await Tritium.sendAudio(msg.from, `data:audio/mpeg;base64,${wstream._memStore.data.toString("base64")}`).catch(
          (e) => {
            Tritium.reply(msg.from, "Erreur mp3 :( ", msg.id);
            console.log(e);
          },
        );
        wstream.end();
      });
  },
  {
    triggers: ["tts", "texttospeech", "speech", "say"],
    usage: "{command} [language] [text]",
    example: ["{command} en I am a robot", "{command} fr Je suis un robot"],
    description: "Converts text to speech.\nSupported languages: *en, fr, ar, de, it, ru, zh*",

    cooldown: 10,
    minArgs: 2,
    groupOnly: true,
  },
);
