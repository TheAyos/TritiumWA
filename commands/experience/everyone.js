const TritiumCommand = require("../../models/TritiumCommand");

module.exports = new TritiumCommand(
  async ({ Tritium, msg, cleanArgs }) => {
    let mentionList = [];
    const cleanParticipants = (await Tritium.getGroupMembers(msg.GROUP_ID)).filter((p) => p.id !== msg.sender.id);

    mentionList.push(`❝ ${cleanArgs} ❞\n _- @${msg.sender.id.split("@").shift()}_\n`);

    mentionList.push(`*┏*  *@everyone*`);
    for (const p of cleanParticipants) {
      mentionList.push(`*┃* 🏅 @${p.id.split("@").shift()}`);
    }
    mentionList.push(`*┗* ☄️☄️☄️`);

    mentionList = mentionList.join("\n");

    Tritium.sendTextWithMentions(msg.from, mentionList);
  },
  {
    triggers: ["everyone"],
    usage: "{command} [message]",
    description: "Tags everyone with that _important_ message.",

    groupOnly: true,
    minArgs: 1,
    userPerms: "ADMINISTRATOR",
  },
);
