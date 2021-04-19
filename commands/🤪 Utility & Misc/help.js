const TritiumCommand = require("../../models/TritiumCommand");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, args }) {
    const settings = require("../../utils/Settings");
    const prefix = msg.isGroupMsg ? await settings.getPrefix(msg.groupId) : Tritium.prefix;

    if (!args.length) {
      const categories = {};
      let cmdCount = 0;

      Tritium.commands.forEach((cmd) => {
        cmdCount++;
        let category = categories[cmd.category];
        if (!category) {
          category = categories[cmd.category] = [];
        }
        category.push(cmd.props.triggers[0]);
      });

      const catCount = Object.keys(categories).length;

      let commandNames = "";
      commandNames = Object.keys(categories)
        .map((catItems) => `\n*${catItems}*\n\`\`\`> ${categories[catItems].join(", ")}\`\`\``)
        .join("");

      let helpMessageFull =
        `*Bot Commands*\n\n` +
        `The prefix of the bot on this group is *${prefix}*\n` +
        `*Example:* ${prefix}help love\n` +
        `𝙍𝙚𝙢𝙞𝙣𝙙: 𝘋𝘰𝘯'𝘵 𝘶𝘴𝘦 [ ] 𝘰𝘳 <> 𝘪𝘯 𝘤𝘰𝘮𝘮𝘢𝘯𝘥𝘴.\n\n` +
        `*A total of ${cmdCount} commands in ${catCount} categories:*` +
        `${commandNames}\n\n`;

      helpMessageFull += `For more info use \`\`\`${prefix}help <command>\`\`\``;
      helpMessageFull += `\n*🤖 Tritium • ${require("moment")().format("HH:mm")}* `;
      Tritium.reply(msg.from, helpMessageFull, msg.id);
    } else {
      const cmd = Tritium.commands.find((c) => c.props.triggers.includes(args[0]));
      if (!cmd) return Tritium.reply(msg.from, "*That command doesn't exist 😲 !!!*", msg.id);
      await Tritium.reply(msg.from, cmd.getHelpMsg(prefix), msg.id, true);
    }
  },
  {
    triggers: ["help", "commands", "cmds", "helpmestepbroimstuck"],
    usage: ["{command}", "{command} <command>"],
    example: "{command} fisheye",
    description: "Shows a list of commands or specific information about a command.",

    groupOnly: true,
  },
);
