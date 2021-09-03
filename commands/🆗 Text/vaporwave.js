const TritiumCommand = require("../../models/TritiumCommand");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, cleanArgs }) {
    await Tritium.reply(
      msg.from,
      cleanArgs
        .split("")
        .map((c) => {
          return c.charCodeAt(0) >= 33 && c.charCodeAt(0) <= 126
            ? String.fromCharCode(c.charCodeAt(0) - 33 + 65281)
            : c;
        })
        .join(""),
      msg.id,
    );
  },
  {
    triggers: ["vaporwave", "vw"],
    description: "*Ｖａｐｏｒｗａｖｅ ！*",
    usage: "{command} [ｗｈａｔ ｙｏｕ ｗａｎｔ ｍｅ ｔｏ ｓａｙ]",

    minArgs: 1,
    groupOnly: true,
  },
);
