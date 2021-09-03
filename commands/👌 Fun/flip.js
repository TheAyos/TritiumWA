const TritiumCommand = require("../../models/TritiumCommand");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg }) {
    let flip = Math.floor(Math.random() * 2) + 1;
    flip = flip === 1 ? "https://i.ibb.co/LJjkVK5/heads.png" : "https://i.ibb.co/wNnZ4QD/tails.png";
    await Tritium.sendStickerfromUrl(msg.from, flip);
  },
  {
    triggers: ["flip", "coin"],
    usage: "{command}",
    example: "{command}",
    description: "Flip a coin !",

    cooldown: 10,
    groupOnly: true,
  },
);
