const TritiumCommand = require("@models/TritiumCommand");
module.exports = new TritiumCommand(
  async ({ Tritium, msg }) => {
    const chat = await Tritium.getChatById(msg.chatId);
    const desc = chat.groupMetadata.desc;
    Tritium.reply(msg.from, `🌠️ *Name:* ${msg.chat.name} \n\n` + `✨️ *Description:* ${desc}`, msg.id, true);
  },
  {
    triggers: ["description", "desc", "groupinfo", "grpinfo"],
    description: "Send a Group's description.",
    groupOnly: true,
  },
);
