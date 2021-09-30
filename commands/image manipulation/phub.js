const TritiumCommand = require("../../models/TritiumCommand");

const fetch = require("node-fetch");

const TEXT_ERROR_IMAGE_PROCESSING = `I wasn't able to process the image correctly. Sorry budd.`;

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, args, cleanArgs }) {
        let pp, hub;

        if (args.length === 1) pp = args[0];
        else if (args.length > 1) {
            cleanArgs = cleanArgs.indexOf("|") > -1 ? cleanArgs.split("|") : args;
            pp = cleanArgs.shift().trim();
            hub = cleanArgs.shift().trim();
        }

        try {
            const loveThat = await fetch(`https://youbyoub.herokuapp.com/api/v1/phub` + `?text1=${encodeURIComponent(pp) || ""}` + `&text2=${encodeURIComponent(hub) || ""}`);
            const processedImage = await loveThat.buffer();
            await Tritium.sendFile(msg.from, `data:image/png;base64,${processedImage.toString("base64")}`, "phub.png", "", msg.id);
        } catch (error) {
            Tritium.error(error);
            return Tritium.reply(msg.from, TEXT_ERROR_IMAGE_PROCESSING, msg.id);
        }
    },
    {
        triggers: ["phub", "ph", "pornhub"],
        usage: ["{command} [1st text] [2nd text]"],
        example: ["{command} Nrop hub..."],
        description: "Generates a P**nHub logo from given text !",

        cooldown: 7,
        minArgs: 2,
        groupOnly: true,
    },
);
