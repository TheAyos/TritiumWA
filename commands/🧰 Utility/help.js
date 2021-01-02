const TritiumCommand = require("@models/TritiumCommand");

module.exports = new TritiumCommand(
  async ({ Tritium, msg, args }) => {
    if (!args.length) {
      let categories = {};
      let cmdCount = 0;
      Tritium.commands.forEach((cmd) => {
        cmdCount++;
        let category = categories[cmd.category];
        if (!category) {
          category = categories[cmd.category] = [];
        }
        category.push(cmd.props.triggers[0]);
      });

      let commandNames = "";
      commandNames = Object.keys(categories).map(
        (category) => `\n*${category}*\n\`\`\`> ${categories[category].join(", ")}\`\`\``,
      );

      let helpMessageFull =
        `*Bot Commands*\n\n` +
        `The prefix of the bot on this server is *${Tritium.prefix}*\n` +
        `*Example:* ${Tritium.prefix}help love\n` +
        `𝙍𝙚𝙢𝙞𝙣𝙙: 𝘋𝘰𝘯'𝘵 𝘶𝘴𝘦 [ ] 𝘰𝘳 <> 𝘪𝘯 𝘤𝘰𝘮𝘮𝘢𝘯𝘥𝘴.\n\n` +
        `*A total of ${cmdCount} commands:*` +
        `${commandNames}\n\n`;

      helpMessageFull += `For more info use \`\`\`${Tritium.prefix}help <command>\`\`\``;
      helpMessageFull += `\n*🤖 Tritium • ${require("moment")().format("HH:mm")}* `;
      Tritium.reply(msg.from, helpMessageFull, msg.id);
    } else {
      let cmd = Tritium.getCommand(args[0]) || Tritium.getCommand(args);
      if (!cmd) return Tritium.reply(msg.from, "*That command doesn't exist 😲 !!!*", msg.id);

      // TODO: custom prefix references
      let gPrefix = Tritium.prefix;

      Tritium.reply(msg.from, cmd.getHelpMsg(gPrefix), msg.id, true);
    }
  },
  {
    triggers: ["help", "commands", "cmds", "helpmestepbroimstuck"],
    usage: ["{command}", "{command} <command>"], //TODO: category??
    example: "{command} fisheye",
    description: "Shows a list of commands or specific information about a command.",
  },
);
