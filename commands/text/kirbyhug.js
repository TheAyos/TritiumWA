const TritiumCommand = require("../../models/TritiumCommand");
const TextUtils = require("../../utils/TextUtils");

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, cleanArgs }) {
        await Tritium.reply(msg.from, TextUtils.kirbyHug(cleanArgs), msg.id);
    },
    {
        triggers: ["kirbyhug", "kbhug"],
        description: "(っ◔◡◔)っ ♥ Gotta hug that text ♥",
        usage: "{command} [some_text]",

        minArgs: 1,
    },
);
