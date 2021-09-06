const TritiumCommand = require("../../models/TritiumCommand");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { createCanvas, loadImage } = require("canvas");

const MAX_ALLOWED_FILESIZE_BYTES = 15 * 10e6;

const TEXT_IMAGE_TOO_BIG = `Resulting image was too big (> ${MAX_ALLOWED_FILESIZE_BYTES / 10e6} MB).`;
const TEXT_ERROR_IMAGE_PROCESSING = `I wasn't able to process the image correctly. Sorry budd.`;

const DYNAMIC_TEXT_SEND_OR_QUOTE_IMG = (name) => `${name} send or quote an image !`;

module.exports = new TritiumCommand(
    async function ({ Tritium, msg }) {
        const isQuotedImage = msg.quotedMsg && msg.quotedMsg.type === "image";
        if (!isQuotedImage) return Tritium.reply(msg.from, DYNAMIC_TEXT_SEND_OR_QUOTE_IMG(msg.sender.pushname), msg.id);

        const glassShatter = Tritium.fromRootPath("assets/images/glass_shatter.png");

        try {
            const encryptMedia = isQuotedImage ? msg.quotedMsg : msg;
            const mediaData = await decryptMedia(encryptMedia);

            const data = await loadImage(mediaData);
            const canvas = createCanvas(data.width, data.height);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(data, 0, 0);

            const overlay = await loadImage(glassShatter);
            ctx.drawImage(overlay, 0, 0, data.width, data.height);

            const processedImage = canvas.toBuffer();
            if (Buffer.byteLength(processedImage) > MAX_ALLOWED_FILESIZE_BYTES) return Tritium.reply(msg.from, TEXT_IMAGE_TOO_BIG, msg.id);

            await Tritium.sendImage(msg.from, `data:image/png;base64,${processedImage.toString("base64")}`, "glassShatter.png", "", msg.id);
        } catch (error) {
            Tritium.log(error);
            return Tritium.reply(msg.from, TEXT_ERROR_IMAGE_PROCESSING, msg.id);
        }
    },
    {
        triggers: ["shatter", "glass", "glass-shatter"],
        usage: "{command} (with quoted image)",
        description: "Draws an image with glass shatter in front of it !",

        cooldown: 10,
        groupOnly: true,
    },
);
