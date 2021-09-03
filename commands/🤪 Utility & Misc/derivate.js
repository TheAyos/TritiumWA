const TritiumCommand = require("../../models/TritiumCommand");
const math = require("mathjs");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, cleanArgs }) {
    let caption = `*Function*\n` + `\`\`\`${cleanArgs}\`\`\`\n`;
    try {
      caption += `*Derivative*\n` + `\`\`\`${math.derivative(cleanArgs, "x")}\`\`\``;
    } catch (error) {
      caption = `*That doesn't seem like a valid function to me 🧐*`;
    }
    await Tritium.reply(msg.from, caption, msg.id, true);
  },
  {
    triggers: ["derivate", "f'"],
    usage: ["{command} [expression]"],
    example: ["{command} 1 / x"],
    description: "Gimme a function and i will derivate it for x 😎🤓",
    cooldown: 5,
    minArgs: 1,
  },
);
