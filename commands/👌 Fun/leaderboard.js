const TritiumCommand = require("../../models/TritiumCommand");
const Experience = require("../../utils/Experience");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg }) {
    const target = msg.mentionedJidList[0] || msg.sender.id;

    const leaderboard = await Experience.fetchLeaderboard(msg.groupId);

    if (leaderboard.length < 1) return Tritium.reply(msg.from, "Nobody's in leaderboard yet.", msg.id);

    let position = leaderboard.findIndex((i) => i.groupID === msg.groupId && i.userID === target) + 1;
    let user = leaderboard[position - 1];

    if (!user) return Tritium.reply(msg.from, "Seems like the user didn't earn any xp yet 😑.", msg.id);

    let displayName;

    let contact = await Tritium.getContact(target);
    displayName = contact.pushname ?? msg.sender.pushname;

    let lbcard =
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
