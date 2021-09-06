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
        const fileName = `./temp/${msg.from}_widen.webp`;

        try {
            writeFileSync(fileName, mediaData);
            execSync(`convert ${fileName} -resize 200x100!% ${fileName}`);

            const fileSizeBytes = statSync(fileName).size;
            Tritium.log(fileSizeBytes + " bytes");

            if (fileSizeBytes > MAX_ALLOWED_FILESIZE_BYTES) return Tritium.reply(msg.from, TEXT_IMAGE_TOO_BIG, msg.id);

            const fatWidePutin = `data:image/webp;base64,${readFileSync(fileName, { encoding: "base64" })}`;
            await Tritium.sendFile(msg.from, fatWidePutin, "fatWidePutin.webp", "🍔🍔", msg.id);
        } catch (error) {
            Tritium.error(error);
            return Tritium.reply(msg.from, TEXT_ERROR_IMAGE_PROCESSING, msg.id);
        } finally {
            try {
                if (existsSync(fileName)) unlinkSync(fileName);
                Tritium.log(fileName, "Widen cleaning...");
            } catch (error) {
                Tritium.error("Widen: Unable to clean temp files:\n" + error);
            }
        }
    },
    {
        triggers: ["widen", "putin", "fatify", "🍔🍔"],
        usage: "{command} (with quoted image)",
        example: "",
        description: "Gotta make that image look ```W I D E E E```, _big ol' Putin would be proud 😿..._",

        cooldown: 10,
        groupOnly: true,
    },
);
