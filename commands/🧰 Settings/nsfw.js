const TritiumCommand = require("../../models/TritiumCommand");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, args }) {
    const currentNsfw = await Tritium.db.Settings.getNsfw(msg.groupId);
    if (!args.length)
      return Tritium.reply(
        msg.from,
        `*Currently, NSFW is ${currentNsfw ? "enabled 😏" : "disabled 😇"} here.*`,
        msg.id,
      );

    const isAdmin =
      msg.chat.groupMetadata.participants.find((c) => c.id === msg.sender.id && c.isAdmin) ||
      msg.sender.id === Tritium.config.youb_id;
    if (!isAdmin) return Tritium.reply(msg.from, "You need to be administrator to do this.", msg.id);

    let newNsfw;

    if (args[0] === "enable") {
      newNsfw = true;
    } else if (args[0] === "disable") {
      newNsfw = false;
    } else {
      return Tritium.helpThisPoorMan(msg, this);
    }

    await Tritium.db.Settings.setNsfw(msg.groupId, newNsfw).catch((e) => console.log(e));

    await Tritium.reply(msg.from, `*NSFW is now ${newNsfw ? "enabled 😏" : "disabled 😇"} here.*`, msg.id);
  },
  {
    triggers: ["nsfw", "setnsfw"],
    description: "Configure nsfw in this group or get info.",
    usage: "{command} <enable|disable>",
    example: "{command} enable",

    groupOnly: true,
  },
);
