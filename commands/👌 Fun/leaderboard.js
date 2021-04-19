const TritiumCommand = require("../../models/TritiumCommand");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg }) {
    const target = msg.mentionedJidList[0] || msg.sender.id;

    const leaderboard = await Tritium.db.Experience.fetchLeaderboard(msg.groupId);

    if (leaderboard.length < 1) return Tritium.reply(msg.from, "Nobody's in leaderboard yet.", msg.id);

    const position = leaderboard.findIndex((i) => i.groupID === msg.groupId && i.userID === target) + 1;
    const user = leaderboard[position - 1];

    if (!user) return Tritium.reply(msg.from, "Seems like the user didn't earn any xp yet 😑.", msg.id);

    const contact = await Tritium.getContact(target);
    const displayName = contact.pushname || msg.sender.pushname;

    const lbcard =
      `*${displayName}* is\n` +
      `🥇 *${position.toOrdinal()}* in *${msg.chat.name}*\n` +
      `✨ *Level: ${user.level}*\n` +
      `🌌 *XP: ${user.xp}*`;
    await Tritium.reply(msg.from, lbcard, msg.id);
  },
  {
    triggers: ["leaderboard", "lb", "topxp"],
    description: "Where are you on the leaderboard ?",

    groupOnly: true,
  },
);
