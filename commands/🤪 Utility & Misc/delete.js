const TritiumCommand = require("../../models/TritiumCommand");

module.exports = new TritiumCommand(
  async ({ Tritium, msg }) => {
    /* Useful
    const groupAdminList = msg.isGroupMsg ? await Tritium.getGroupAdmins(msg.GROUP_ID) : "";
    const isSenderGroupAdmin = msg.isGroupMsg ? groupAdminList.includes(msg.sender.id) : false
    const isBotGroupAdmin = msg.isGroupMsg ? groupAdminList.includes(Tritium.hostNumber + "@c.us") : false;
    */

    console.log(await Tritium.getGroupMembers(msg.GROUP_ID));
    await Tritium.deleteMessage(msg.quotedMsgObj.chatId, msg.quotedMsgObj.id, false);
    if (!msg.quotedMsgObj.fromMe)
      return await Tritium.reply(msg.from, "*👁‍🗨 Can only delete my messages !*", msg.id);

    console.log("quoted msg : ", msg.quotedMsg);
    console.log("quoted msg : obj", msg.quotedMsgObj);
  },
  {
    triggers: ["delete", "delmsg"],
    description: "Delete a message sent by Tritium.",

    groupOnly: true,
    cooldown: 10,
    minArgs: "quotedMsg",
    perms: "ADMINISTRATOR",
  },
);
