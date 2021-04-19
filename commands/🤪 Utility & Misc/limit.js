const TritiumCommand = require("../../models/TritiumCommand");
const Limit = require("../../utils/Limit");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg }) {
    const target = msg.mentionedJidList[0] ?? msg.sender.id;

    let contact = await Tritium.getContact(target);
    displayName = contact.pushname ?? msg.sender.pushname;

    let limit = await Limit.getLimit(target);

    let caption = `❧ *${displayName}* has *${limit} uses* left 🌟`;

    await Tritium.reply(msg.from, caption, msg.id);
  },
  {
    triggers: ["limit", "quota"],
    description: "How much command uses have you left 🙃 ?",

    groupOnly: true,
    isNotQuotaLimited: true,
  },
);
