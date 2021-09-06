const TritiumCommand = require("../../models/TritiumCommand");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { createCanvas, loadImage } = require("canvas");

const MAX_ALLOWED_FILESIZE_BYTES = 15 * 10e6;

const TEXT_IMAGE_TOO_BIG = `Resulting image was way too big (> ${MAX_ALLOWED_FILESIZE_BYTES / 10e6} MB).`;
const TEXT_ERROR_IMAGE_PROCESSING = `I wasn't able to process the image correctly. Sorry budd.`;

const DYNAMIC_TEXT_SEND_OR_QUOTE_IMG = (name) => `${name} send or quote an image !`;

module.exports = new TritiumCommand(
    async ({ Tritium, msg }) => {
        const isQuotedImage = msg.quotedMsg && msg.quotedMsg.type === "image";
        if (!msg.isMedia && !isQuotedImage) return Tritium.reply(msg.from, DYNAMIC_TEXT_SEND_OR_QUOTE_IMG(msg.sender.pushname), msg.id);

        const brazzersWatermark = Tritium.fromRootPath("assets/images/brazzers.png");
        Tritium.reply(msg.from, "_Your image is cuming 😉 !_", msg.id);

        try {
            const encryptMedia = isQuotedImage ? msg.quotedMsg : msg;
            const mediaData = await decryptMedia(encryptMedia);

            const data = await loadImage(mediaData);
            const canvas = createCanvas(data.width, data.height);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(data, 0, 0);

            const overlay = await loadImage(brazzersWatermark);

            const ratio = overlay.width / overlay.height;
            const width = data.width / 3;
            const height = Math.round(width / ratio);
            const padding = data.width / 50;
            ctx.drawImage(overlay, padding, data.height - height - padding, width, height);

            const processedImage = canvas.toBuffer();
            if (Buffer.byteLength(processedImage) > MAX_ALLOWED_FILESIZE_BYTES) return Tritium.reply(msg.from, TEXT_IMAGE_TOO_BIG, msg.id);

            await Tritium.sendImage(msg.from, `data:image/png;base64,${processedImage.toString("base64")}`, "brazzers.png", "", msg.id);
        } catch (error) {
            Tritium.error(error);
            return Tritium.reply(msg.from, TEXT_ERROR_IMAGE_PROCESSING, msg.id);
        }
    },
    {
        triggers: ["brazzers", "bzz"],
        usage: "{command} (with quoted image)",
        description: "Add a Brazzers watermark to an image.",
        cooldown: 10,
        groupOnly: true,
    },
);
