const TritiumCommand = require("../../models/TritiumCommand");
const TextUtils = require("../../utils/TextUtils");

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, cleanArgs }) {
        await Tritium.reply(msg.from, TextUtils.scriptify(cleanArgs), msg.id);
    },
    {
        triggers: ["scriptify", "spt"],
        description: "𝒮𝒸𝓇𝒾𝓅𝓉𝒾𝒻𝓎 𝓈𝑜𝓂𝑒 𝓉𝑒𝓍𝓉",
        usage: "{command} [𝓌𝒽𝒶𝓉 𝓎𝑜𝓊 𝓌𝒶𝓃𝓉 𝓂𝑒 𝓉𝑜 𝓈𝒶𝓎]",

        minArgs: 1,
        groupOnly: true,
    },
);
