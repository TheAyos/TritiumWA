const TritiumCommand = require("../../models/TritiumCommand");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg }) {
    const target = msg.mentionedJidList[0] || msg.sender.id;

    const user = await Tritium.db.Experience.fetch(target, msg.GROUP_ID, true);

    if (!user) return Tritium.reply(msg.from, "Seems like the user didn't earn any xp yet 😑.", msg.id);

    const nextLvlXp = (user.level + 1) ** 2 * 100;
    const xpToLvlUp = nextLvlXp - user.xp;
    const xpcard =
      `*${msg.sender.pushname}* is\n` +
      `*Level ${user.level} with 🌟 ${user.xp}/${nextLvlXp} xp*\n` +
      `Only *🌟 ${xpToLvlUp} more xp* to *level ${user.level + 1} 🌌*`;
    await Tritium.reply(msg.from, xpcard, msg.id);
  },
  {
    triggers: ["level", "lvl", "rank", "xp"],
    description: "What level are you 🌟 ?",

    groupOnly: true,
  },
);
