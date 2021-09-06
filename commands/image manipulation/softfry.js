const TritiumCommand = require("../../models/TritiumCommand");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { writeFileSync, readFileSync, existsSync, unlinkSync, statSync } = require("fs");
const { execSync } = require("child_process");

const MAX_ALLOWED_FILESIZE_BYTES = 15 * 10e6;

const TEXT_IMAGE_TOO_BIG = `Resulting image was too big (> ${MAX_ALLOWED_FILESIZE_BYTES / 10e6} MB).`;
const TEXT_ERROR_IMAGE_PROCESSING = `I wasn't able to process the image correctly. Sorry budd.`;

const DYNAMIC_TEXT_SEND_OR_QUOTE_IMG = (name) => `${name} send or quote an image !`;

// convert img.jpg -liquid-rescale 50% -emboss 0x1.1 b.jpg +noise Gaussian -attenuate .5 b.jpg --> 2.2s half-sized image
// convert aaa.png -liquid-rescale 50% -liquid-rescale 200% -modulate 50,200 -emboss 0x1.1 b.jpg +noise Gaussian -attenuate .5 b.jpg --> 5s full-sized image

module.exports = new TritiumCommand(
    async ({ Tritium, msg }) => {
        const isQuotedImage = msg.quotedMsg && msg.quotedMsg.type === "image";
        if (!msg.isMedia && !isQuotedImage) return Tritium.reply(msg.from, DYNAMIC_TEXT_SEND_OR_QUOTE_IMG(msg.sender.pushname), msg.id);

        const fileName = `./temp/${msg.from}_softfry.webp`;

        try {
            const encryptedMedia = isQuotedImage ? msg.quotedMsg : msg;
            const mediaData = await decryptMedia(encryptedMedia);

            writeFileSync(fileName, mediaData);
            execSync(`convert ${fileName} -liquid-rescale 50% -emboss 0x1.1 +noise Gaussian -attenuate .5 ${fileName}`);

            const fileSizeBytes = statSync(fileName).size;
            Tritium.log(fileSizeBytes + " bytes");

            if (fileSizeBytes > MAX_ALLOWED_FILESIZE_BYTES) return Tritium.reply(msg.from, TEXT_IMAGE_TOO_BIG, msg.id);

            const softlyFriedImage = `data:image/webp;base64,${readFileSync(fileName, { encoding: "base64" })}`;
            await Tritium.sendFile(msg.from, softlyFriedImage, "softlyFriedImage.webp", "🔥🔥", msg.id);
        } catch (error) {
            Tritium.error(error);
            return Tritium.reply(msg.from, TEXT_ERROR_IMAGE_PROCESSING, msg.id);
        } finally {
            try {
                if (existsSync(fileName)) unlinkSync(fileName);
                Tritium.log(fileName, "Softfry cleaning...");
            } catch (error) {
                Tritium.error("Softfry: Unable to clean temp files:\n" + error);
            }
        }
    },
    {
        triggers: ["softfry", "sf"],
        usage: "{command} (with quoted image)",
        description: "(Very gently) fry an image.",
        cooldown: 10,
        groupOnly: true,
    },
);
