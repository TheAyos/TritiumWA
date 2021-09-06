const TritiumCommand = require("../../models/TritiumCommand");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { writeFileSync, readFileSync, existsSync, unlinkSync } = require("fs");
const { execSync } = require("child_process");

const TEXT_ERROR_IMAGE_PROCESSING = `I wasn't able to process the image correctly. Sorry budd.`;
const DYNAMIC_TEXT_SEND_OR_QUOTE_IMG = (name) => `${name} send or quote an image !`;

module.exports = new TritiumCommand(
    async function ({ Tritium, msg }) {
        const isQuotedImage = msg.quotedMsg && msg.quotedMsg.type === "image";
        if (!msg.isMedia && !isQuotedImage) return Tritium.reply(msg.from, DYNAMIC_TEXT_SEND_OR_QUOTE_IMG(msg.sender.pushname), msg.id);

        const thermalCameraScript = Tritium.fromRootPath("utils/scripts/thermography");
        const fileName = `./temp/${msg.from}_thermal.webp`;

        try {
            const encryptMedia = isQuotedImage ? msg.quotedMsg : msg;
            const mediaData = await decryptMedia(encryptMedia);

            writeFileSync(fileName, mediaData);
            execSync(`${thermalCameraScript} -l 0 -h 95 ${fileName} ${fileName}`);

            const discreteNigthVision = `data:image/webp;base64,${readFileSync(fileName, { encoding: "base64" })}`;
            await Tritium.sendFile(msg.from, discreteNigthVision, "discreteNigthVision.webp", "🌡️📸📸🌡️", msg.id);
        } catch (error) {
            Tritium.error(error);
            return Tritium.reply(msg.from, TEXT_ERROR_IMAGE_PROCESSING, msg.id);
        } finally {
            try {
                if (existsSync(fileName)) unlinkSync(fileName);
            } catch (error) {
                Tritium.error("Thermal: Unable to clean temp files:\n" + error);
            }
        }
    },
    {
        triggers: ["thermal", "thermo", "📸🌡️", "🌡️📸"],
        usage: "{command} (with quoted image)",
        example: ["{command} (with quoted image)"],
        description: "Apply a *📸🌡️ Thermal Camera 📸🌡️* effect to an image !",

        cooldown: 10,
    },
);
