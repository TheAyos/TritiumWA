const TritiumCommand = require("../../models/TritiumCommand");

module.exports = new TritiumCommand(
  async ({ Tritium, msg, args }) => {
    // const minMem = Tritium.minMembers;
    // TODO: any way of checking if already in a group?

    await Tritium.reply(msg.from, "If you want to me to join a group, you need to add me the traditional way !", msg.id);
    return;

    if (!args[0].match(/(https:\/\/chat.whatsapp.com)/gi))
      return Tritium.reply(msg.from, "Invalid link.", msg.id);

    const grpInfo = await Tritium.inviteInfo(args[0]);
    console.log(grpInfo);
    if (typeof grpInfo !== "object") return Tritium.reply(msg.from, "Invalid link.", msg.id);

    if (grpInfo.size < 5) return Tritium.reply(msg.from, "The group does not have 5+ members", msg.id);

    let newGroup = false;
    let t = await Tritium.getGroupInfo(grpInfo.id).catch((e) => (newGroup = true));

    console.log(t);
    if (newGroup) {
      await Tritium.joinGroupViaLink(args[0])
        .then(async (grpId) => {
          await Tritium.reply(
            msg.from,
            `*Joined the group ⚡ !*\n➸ ${grpInfo.subject}\ncan u introduce me to the others plz 🥺 ?`,
            msg.id,
          );
          await Tritium.sendText(
            grpId,
            `Wassup pepol 😁, i'm *Tritium Bot*. Use ${Tritium.prefix}help to see the usable commands` +
              `\nThanks for adding me to *${grpInfo.subject}*.`,
          );
        })
        .catch((error) => {
          console.log(error);
          Tritium.reply(msg.from, "An error occured 😿", msg.id);
        });
    } else {
      Tritium.reply(msg.from, "I'm already in that group !", msg.id);
    }
  },
  {
    triggers: ["join", "invite"],
    usage: "{command} [invite link]",
    example: "{command} https://chat.whatsapp.com/JTMGJUfBCPV9MxDinO1fBZ",
    description: "Add the bot to a group !",

    cooldown: 10,
    minArgs: 1,
  },
);
