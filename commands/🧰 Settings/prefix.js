const TritiumCommand = require("../../models/TritiumCommand");
const Settings = require("../../utils/Settings");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, args }) {
    const currentPrefix = await Settings.getPrefix(msg.groupId);
    if (!args.length) return Tritium.reply(msg.from, `*📝 Current prefix: "${currentPrefix}"*`, msg.id);

    const isAdmin =
      msg.chat.groupMetadata.participants.find((c) => c.id === msg.sender.id && c.isAdmin) ||
      msg.sender.id === Tritium.config.youb_id;
    if (!isAdmin) return Tritium.reply(msg.from, "You need to be administrator to do this.", msg.id);

    const newPrefix = args[0];

    await Settings.setPrefix(msg.groupId, newPrefix).catch((e) => console.log(e));

    await Tritium.reply(
      msg.from,
      `*~🔮 Prefix settings ~*\n\n` +
        `*📝 New prefix "${newPrefix}" set !*\n` +
        `_📜 Old Prefix: "${currentPrefix}"_\n`,
      msg.id,
    );
  },
  {
    triggers: ["prefix", "setprefix"],
    description: "Configure command prefix in this group.",
    usage: "{command} [prefix]",
    example: "{command} /",

    groupOnly: true,
  },
);
