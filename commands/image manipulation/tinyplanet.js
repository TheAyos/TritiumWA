const TritiumCommand = require("../../models/TritiumCommand");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { writeFileSync, readFileSync, existsSync, unlinkSync, statSync } = require("fs");
const { execSync } = require("child_process");

const MAX_ALLOWED_FILESIZE_BYTES = 15 * 10e6;

const TEXT_IMAGE_TOO_BIG = `Resulting image was too big (> ${MAX_ALLOWED_FILESIZE_BYTES / 10e6} MB).`;
const TEXT_ERROR_IMAGE_PROCESSING = `I wasn't able to process the image correctly. Sorry budd.`;

const DYNAMIC_TEXT_SEND_OR_QUOTE_IMG = (name) => `${name} send or quote an image !`;

module.exports = new TritiumCommand(
    async function ({ Tritium, msg }) {
        const isQuotedImage = msg.quotedMsg && msg.quotedMsg.type === "image";
        if (!msg.isMedia && !isQuotedImage) return Tritium.reply(msg.from, DYNAMIC_TEXT_SEND_OR_QUOTE_IMG(msg.sender.pushname), msg.id);

        const encryptedMedia = isQuotedImage ? msg.quotedMsg : msg;
        const mediaData = await decryptMedia(encryptedMedia);
        const fileName = `./temp/${msg.from}_tinyplanet.webp`;

        try {
            writeFileSync(fileName, mediaData);
            execSync(`convert ${fileName} -rotate 180 -virtual-pixel HorizontalTile -background white +distort Polar 0 +repage -rotate 180 ${fileName}`);

            const fileSizeBytes = statSync(fileName).size;
            Tritium.log(fileSizeBytes + " bytes");

            if (fileSizeBytes > MAX_ALLOWED_FILESIZE_BYTES) return Tritium.reply(msg.from, TEXT_IMAGE_TOO_BIG, msg.id);

            const cuteLittlePlanet = `data:image/webp;base64,${readFileSync(fileName, { encoding: "base64" })}`;
            await Tritium.sendFile(msg.from, cuteLittlePlanet, "cuteLittlePlanet.webp", "🥺🌍", msg.id);
        } catch (error) {
            Tritium.error(error);
            return Tritium.reply(msg.from, TEXT_ERROR_IMAGE_PROCESSING, msg.id);
        } finally {
            try {
                if (existsSync(fileName)) unlinkSync(fileName);
                Tritium.log(fileName, "Tinyplanet cleaning...");
            } catch (error) {
                Tritium.error("Tinyplanet: Unable to clean temp files:\n" + error);
            }
        }
    },
    {
        // TODO: add options ? /:D nah nah
        triggers: ["tinyplanet", "littleplanet", "planet", "🥺🌍"],
        usage: "{command} (with quoted image)",
        example: "",
        description: "Apply a _cuuute_ *🥺🌍 Tiny Planet 🥺🌍* effect to quoted image !",

        cooldown: 10,
        groupOnly: true,
    },
);
