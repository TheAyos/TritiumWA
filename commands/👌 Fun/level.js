const TritiumCommand = require("../../models/TritiumCommand");
const Experience = require("../../utils/Experience");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg }) {
    const target = msg.mentionedJidList[0] || msg.sender.id;

    let user = await Experience.fetch(target, msg.groupId, true);

    if (!user) return Tritium.reply(msg.from, "Seems like the user didn't earn any xp yet 😑.", msg.id);

    let nextLvlXp = (user.level + 1) ** 2 * 100;
    let xpToLvlUp = nextLvlXp - user.xp;
    let xpcard =
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
