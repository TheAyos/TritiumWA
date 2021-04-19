const TritiumCommand = require("../../models/TritiumCommand");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, args, cleanArgs }) {
    const groupsOnly = args[0] === "groups" ? true : false;
    try {
      const allChats = await Tritium.getAllChatIds();
      for (const id of allChats) {
        const chat = await Tritium.getChatById(id);
        if (!chat.isGroup && groupsOnly) return;
        if (chat.isReadOnly) console.log("that A READONLY CHAT -> ", chat.name);

        if (!chat.isReadOnly) Tritium.sendText(id, `*☄️ [ζ͜͡𝗧𝗿𝗶𝘁𝗶𝘂𝗺꠸ Bot Broadcast]*\n\n${cleanArgs}`);
      }
      Tritium.reply(msg.from, `*Broadcast Success ! _Broadcasted to ${allChats.length} chats._*`, msg.id);
    } catch (err) {
      return Tritium.reply(
        msg.from,
        `Oh no, an error occurred: \`${err.message}\`. Try again later!`,
        msg.id,
      );
    }
  },
  {
    triggers: ["broadcast", "bc"],
    usage: ["{command} [message]", "{command} groups [message]"],
    description: "Broadcasts a message to all chats (groups only or groups & individual chats)",

    ownerOnly: true,
    minArgs: 1,
    groupOnly: true,
  },
);
