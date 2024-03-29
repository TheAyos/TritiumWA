const TritiumCommand = require("../../models/TritiumCommand");
const TextUtils = require("../../utils/TextUtils");

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, cleanArgs }) {
        await Tritium.reply(msg.from, TextUtils.uppercase(cleanArgs), msg.id);
    },
    {
        triggers: ["uppercase", "upc"],
        description: "uPpErCaSe tHaT !",
        usage: "{command} [some_text]",

        minArgs: 1,
    },
);
