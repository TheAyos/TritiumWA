const TritiumCommand = require("../../models/TritiumCommand");

const fetch = require("node-fetch");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg }) {
    let target, ppUrl;

    if (!msg.mentionedJidList.length) target = msg.sender.id;
    else target = msg.mentionedJidList[0];

    ppUrl = await Tritium.getProfilePicFromServer(target);
    if (!ppUrl) return Tritium.reply(msg.from, "*🏜️ No profile pic found.*", msg.id);

    const thatPp = await fetch(ppUrl);
    const buff = await thatPp.buffer();
    Tritium.sendFile(msg.from, `data:image/png;base64,${buff.toString("base64")}`, "ppic.png", "", msg.id);
  },
  {
    triggers: ["profilepic", "ppic"],
    usage: ["{command} [User mention]"],
    example: ["{command} @☄️ζ͜͡𝗧𝗿𝗶𝘁𝗶𝘂𝗺꠸"],
    description: "Get your or a user's profile picture !",

    cooldown: 15,
    groupOnly: true,
  },
);
