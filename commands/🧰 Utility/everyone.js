const TritiumCommand = require("@models/TritiumCommand");

module.exports = new TritiumCommand(
  async ({ Tritium, msg, cleanArgs }) => {
    if (!msg.chat.isGroup) return Tritium.sendText(msg.from, "Only usable in groups!");

    let mentionList = [];
    let cleanParticipants = (await Tritium.getGroupMembers(msg.groupId)).filter(
      (p) => p.id !== msg.sender.id,
    );

    mentionList.push(`❝ ${cleanArgs} ❞\n _- @${msg.sender.id.split("@").shift()}_\n`);

    mentionList.push(`*┏* @everyone`);
    for (p of cleanParticipants) {
      mentionList.push(`*┃* 🏅 @${p.id.split("@").shift()}`);
    }
    mentionList.push(`*┗* ☄️`);

    mentionList = mentionList.join("\n");

    Tritium.sendTextWithMentions(msg.from, mentionList);
  },
  {
    triggers: ["everyone"],
    usage: "{command} <message>",
    description: "Tags everyone with that _important_ message.",
    groupOnly: true,
    minArgs: 1,
    permissions: "ADMINISTRATOR",
  },
);
