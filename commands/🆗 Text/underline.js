const TritiumCommand = require("../../models/TritiumCommand");
module.exports = new TritiumCommand(
  async function ({ Tritium, msg, cleanArgs }) {
    await Tritium.reply(msg.from, cleanArgs.split("").join("̳") + "̳", msg.id);
  },
  {
    triggers: ["underline", "ul"],
    description: "U̳n̳d̳e̳r̳l̳i̳n̳e̳ ̳t̳h̳a̳t̳ ̳!",
    usage: "{command} [W̳h̳a̳t̳ ̳y̳o̳u̳ ̳w̳a̳n̳t̳ ̳m̳e̳ ̳t̳o̳ ̳s̳a̳y̳]",

    minArgs: 1,
    groupOnly: true,
  },
);
