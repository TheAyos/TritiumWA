const TritiumCommand = require("../../models/TritiumCommand");
const TextUtils = require("../../utils/TextUtils");

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, cleanArgs }) {
        await Tritium.reply(msg.from, TextUtils.superScriptify(cleanArgs), msg.id);
    },
    {
        triggers: ["superscript", "sspt"],
        description: "ˢᵘᵖᵉʳˢᶜʳⁱᵖᵗⁱᶠʸ ˢᵒᵐᵉ ᵗᵉˣᵗ",
        usage: "{command} [ʷʰᵃᵗ ᵈᵒ ʸᵒᵘ ʷᵃⁿᵗ ᵐᵉ ᵗᵒ ˢᵃʸ]",

        minArgs: 1,
        groupOnly: true,
    },
);
