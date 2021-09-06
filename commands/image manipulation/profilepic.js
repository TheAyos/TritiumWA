const TritiumCommand = require("../../models/TritiumCommand");

const TEXT_ERROR_NO_PROFILE_PIC_FOUND = `*🏜️ No profile pic found.*`;

module.exports = new TritiumCommand(
    async function ({ Tritium, msg }) {
        const target = !msg.mentionedJidList.length ? msg.sender.id : msg.mentionedJidList[0];

        const ppUrl = await Tritium.getProfilePicFromServer(target);
        if (!ppUrl || ppUrl.includes("ERROR")) return Tritium.reply(msg.from, TEXT_ERROR_NO_PROFILE_PIC_FOUND, msg.id);

        console.log(ppUrl);
        await Tritium.sendFile(msg.from, ppUrl, "ppic.png", "", msg.id);
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
