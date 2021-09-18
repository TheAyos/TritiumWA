const TritiumCommand = require("../../models/TritiumCommand");
const TextUtils = require("../../utils/TextUtils");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, cleanArgs }) {
    await Tritium.reply(
      msg.from,
      TextUtils.vaporwave(cleanArgs),
      msg.id,
    );
  },
  {
    triggers: ["vaporwave", "vw"],
    description: "*Ｖａｐｏｒｗａｖｅ ！*",
    usage: "{command} [some_text]",

    minArgs: 1,
  },
);
