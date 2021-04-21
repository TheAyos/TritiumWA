const TritiumCommand = require("../../models/TritiumCommand");
module.exports = new TritiumCommand(
  async function ({ Tritium, msg }) {
    const loadedMsgs = await Tritium.getAmountOfLoadedMessages();
    const chatIds = await Tritium.getAllChatIds();
    const groups = await Tritium.getAllGroups();
    // chatIds.forEach(async (c) => !c.match("@g.us") && !c.match(Tritium.config.youb_id) && (await Tritium.deleteChat(c)));

    await Tritium.sendText(
      msg.from,
      `Stats :\n• *${loadedMsgs}* Loaded messages • *${chatIds.length}* Total chats • *${groups.length}* Group chats`,
    );
  },
  {
    triggers: ["stats", "botstats"],
    description: "Send Tritium stats.",
    groupOnly: true,
  },
);
