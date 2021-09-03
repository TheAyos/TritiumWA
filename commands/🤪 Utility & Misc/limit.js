const TritiumCommand = require("../../models/TritiumCommand");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg }) {
    const target = msg.mentionedJidList[0] || msg.sender.id;

    const contact = await Tritium.getContact(target);
    const displayName = contact.pushname || msg.sender.pushname;

    const limit = await Tritium.db.Limit.getLimit(target);

    const caption = `❧ *${displayName}* has *${limit} uses* left 🌟`;

    await Tritium.reply(msg.from, caption, msg.id);
  },
  {
    triggers: ["limit", "quota"],
    description: "How much command uses have you left 🙃 ?",

    groupOnly: true,
    isNotQuotaLimited: true,
  },
);
