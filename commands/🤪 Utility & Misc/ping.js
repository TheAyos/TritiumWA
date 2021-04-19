const TritiumCommand = require("../../models/TritiumCommand");
const moment = require("moment");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg }) {
    await Tritium.sendText(
      msg.from,
      `Pong 🏓 !!\n\`\`\`Speed: ${Tritium.processTime(msg.t, moment())} s\`\`\``,
      true,
    );
  },
  {
    triggers: ["ping", "latency", "speed"],
    description: "Shows bot ping.",
  },
);
