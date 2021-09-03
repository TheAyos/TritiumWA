const TritiumCommand = require("../../models/TritiumCommand");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg }) {
    try {
      const allChats = await Tritium.getAllChatIds();
      let deletedReadOnly = 0,
        deletedIndividual = 0,
        leftGroups = 0;

      console.log(allChats);
      for (const id of allChats) {
        const chat = await Tritium.getChatById(id);
        if (chat.isReadOnly) {
          await Tritium.deleteChat(id);
          deletedReadOnly++;
        } else if (!chat.isGroup && id !== Tritium.config.youb_id) {
          await Tritium.deleteChat(id);
          deletedIndividual++;
        } else if (chat.isGroup && !id.startsWith(Tritium.config.youb_id.split("@")[0])) {
          // if its a group and its not created by me
          const groupMemCount = chat.groupMetadata.participants.length - 1;
          if (chat.groupMetadata && groupMemCount <= 15 && groupMemCount > 0) {
            /* await Promise.all([
              Tritium.sendText(
                id,
                `*Leaving group because of low number of members.*\n` +
                  `_*Its been a pleasure 🎩.*_` +
                  `\n${chat.name} ${groupMemCount}`,
              ),
              Tritium.leaveGroup(id),
              Tritium.deleteChat(id),
            ]);*/
            leftGroups++;
          }
        } else {
          continue;
        }
      }

      const total = deletedReadOnly + deletedIndividual + leftGroups;
      await Tritium.reply(
        msg.from,
        `*Cleanup Success ! _Deleted ${total} chats._*\n` +
          `> *${deletedReadOnly}* read only chats\n` +
          `> *${deletedIndividual}* individual chats\n` +
          `> *${leftGroups}* left groups`,
        msg.id,
      );
    } catch (err) {
      return Tritium.reply(msg.from, `Oh no, an error occurred: \`\`\`${err.message}\`\`\`. Try again later!`, msg.id);
    }
  },
  {
    triggers: ["cleanup"],
    description: "Clean that mess pls",

    ownerOnly: true,
  },
);
