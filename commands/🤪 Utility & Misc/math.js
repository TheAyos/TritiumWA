const TritiumCommand = require("../../models/TritiumCommand");

const math = require("mathjs");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, cleanArgs }) {
    let caption = `*Expression*\n` + `\`\`\`${cleanArgs}\`\`\`\n`;
    try {
      caption += `*Solution*\n` + `\`\`\`${math.evaluate(cleanArgs)}\`\`\``;
    } catch (error) {
      caption = `*That doesn't seem like a valid question to me 🧐*`;
    }
    await Tritium.reply(msg.from, caption, msg.id, true);
  },
  {
    triggers: ["math", "calc"],
    usage: ["{command} [expression]"],
    example: ["{command} 34 + 35"],
    description: "Calculate things",

    cooldown: 5,
    minArgs: 1,
    groupOnly: true,
  },
);
