const TritiumCommand = require("../../models/TritiumCommand");
module.exports = new TritiumCommand(
  async function ({ Tritium, msg }) {
    await Tritium.sendText(
      msg.from,
      `Pong 🏓 !!\n\`\`\`Speed: ${Tritium.utils.processTime(msg.t, Tritium.utils.moment())} s\`\`\``,
      true,
    );
  },
  {
    triggers: ["ping", "latency", "speed"],
    description: "Shows bot ping.",
  },
);
