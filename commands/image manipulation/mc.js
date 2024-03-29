const TritiumCommand = require("../../models/TritiumCommand");

const fetch = require("node-fetch");

const TEXT_ERROR_IMAGE_PROCESSING = `I wasn't able to process the image correctly. Sorry budd.`;

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, cleanArgs }) {
        try {
            const specialAchievement = await fetch(`https://minecraftskinstealer.com/achievement/13/Achievement%20get!/${encodeURIComponent(cleanArgs)}`);
            const buff = await specialAchievement.buffer();
            await Tritium.sendFile(msg.from, `data:image/png;base64,${buff.toString("base64")}`, "mc.png", "", msg.id);
        } catch (error) {
            Tritium.log(error);
            return Tritium.reply(msg.from, TEXT_ERROR_IMAGE_PROCESSING, msg.id);
        }
    },
    {
        triggers: ["mc", "minecraft"],
        usage: ["{command} [achievement]"],
        example: ["{command} We Need To Go Deeper..."],
        description: "Generates a Minecraft achievement from given text !",

        cooldown: 10,
        minArgs: 1,
        groupOnly: true,
    },
);

/* `https://www.minecraftskinstealer.com/achievement/a.php?i=13&h=Achievement+get%21&t=${encodeURIComponent(cleanArgs)}`*/
