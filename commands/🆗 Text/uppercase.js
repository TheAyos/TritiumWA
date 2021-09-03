const TritiumCommand = require("../../models/TritiumCommand");
module.exports = new TritiumCommand(
  async function ({ Tritium, msg, cleanArgs }) {
    await Tritium.reply(
      msg.from,
      cleanArgs
        .split("")
        .map((c, i) => (i % 2 ? c.toUpperCase() : c))
        .join(""),
      msg.id,
    );
  },
  {
    triggers: ["uppercase", "upc"],
    description: "uPpErCaSe tHaT !",
    usage: "{command} [wHaT yOu wAnT mE tO sAy]",

    minArgs: 1,
    groupOnly: true,
  },
);
