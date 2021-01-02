const TritiumCommand = require("@models/TritiumCommand");
module.exports = new TritiumCommand(
  async ({ Tritium, msg }) => {
    const loadedMsgs = await Tritium.getAmountOfLoadedMessages();
    const chatIds = await Tritium.getAllChatIds();
    const groups = await Tritium.getAllGroups();
    Tritium.sendText(
      msg.from,
      `Stats :\n• *${loadedMsgs}* Loaded messages • *${chatIds.length}* Total chats • *${groups.length}* Group chats`,
    );
  },
  {
    triggers: ["stats", "botstats"],
    description: "Send Tritium stats.",
  },
);
