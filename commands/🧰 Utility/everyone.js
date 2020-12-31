module.exports = {
  triggers: ["everyone"],
  usage: "{command} <message>",
  description: "Tags everyone with that _important_ message.",

  isNSFW: false,
  needArgs: true,
  cooldown: 5,

  run: async function ({ Tritium, msg, cleanArgs }) {
    try {
      if (!msg.chat.isGroup) return Tritium.sendText(msg.from, "Only usable in groups!");

      let mentionList = [];
      let cleanParticipants = (await Tritium.getGroupMembers(msg.groupId)).filter(
        (p) => p.id !== msg.sender.id,
      );

      mentionList.push(`*@${msg.sender.id.split("@").shift()}says:* \n❝\n${cleanArgs}\n❞`);

      for (p of cleanParticipants) {
        mentionList.push(`@${p.id.split("@").shift()}`);
      }
      mentionList = mentionList.join("\n");

      Tritium.sendTextWithMentions(msg.from, mentionList);
    } catch (error) {
      console.log(error);
    }
  },
};
