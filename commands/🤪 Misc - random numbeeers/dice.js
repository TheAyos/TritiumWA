module.exports = {
  triggers: ["dice", "roll"],
  usage: "{command}",
  description: "Rolls a dice.",

  isNSFW: false,
  needArgs: false,
  cooldown: 5,

  run: async function ({ Tritium, msg }) {
    await Tritium.sendStickerfromUrl(
      msg.from,
      `https://www.random.org/dice/dice${Math.floor(Math.random() * 6) + 1}.png`,
    );
  },
};
