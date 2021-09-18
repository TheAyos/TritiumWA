const TritiumCommand = require("../../models/TritiumCommand");
const TextUtils = require("../../utils/TextUtils");

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, cleanArgs }) {
        await Tritium.reply(msg.from, TextUtils.futureGlyphs(cleanArgs), msg.id);
    },
    {
        triggers: ["alienglyph", "alienglyphs"],
        description: "Writes your text so that aliens and evolved humans from the future can read it without too much trouble...",
        usage: "{command} [some_text]",

        minArgs: 1,
    },
);
