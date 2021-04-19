const TritiumCommand = require("../../models/TritiumCommand");
module.exports = new TritiumCommand(
  async function ({ Tritium, msg }) {
    await Tritium.sendStickerfromUrl(
      msg.from,
      `https://www.random.org/dice/dice${Math.floor(Math.random() * 6) + 1}.png`,
    );
  },
  {
    triggers: ["dice", "roll"],
    description: "Rolls a dice.",
    groupOnly: true,
  },
);
