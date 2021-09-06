const TritiumCommand = require("../../models/TritiumCommand");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { createCanvas, loadImage } = require("canvas");

const MAX_ALLOWED_FILESIZE_BYTES = 15 * 10e6;

const TEXT_IMAGE_TOO_BIG = `Resulting image was too big (> ${MAX_ALLOWED_FILESIZE_BYTES / 10e6} MB).`;
const TEXT_ERROR_IMAGE_PROCESSING = `I wasn't able to process the image correctly. Sorry budd.`;

const DYNAMIC_TEXT_SEND_OR_QUOTE_IMG = (name) => `${name} send or quote an image !`;

module.exports = new TritiumCommand(
    async ({ Tritium, msg }) => {
        const isQuotedImage = msg.quotedMsg && msg.quotedMsg.type === "image";
        if (!isQuotedImage) return Tritium.reply(msg.from, DYNAMIC_TEXT_SEND_OR_QUOTE_IMG(msg.sender.pushname), msg.id);

        try {
            const encryptMedia = isQuotedImage ? msg.quotedMsg : msg;
            const mediaData = await decryptMedia(encryptMedia);

            const data = await loadImage(mediaData);
            const canvas = createCanvas(data.width, data.height);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(data, 0, 0);

            desaturate(ctx, -20, 0, 0, data.width, data.height);
            contrast(ctx, 0, 0, data.width, data.height);

            const processedImage = canvas.toBuffer();
            if (Buffer.byteLength(processedImage) > MAX_ALLOWED_FILESIZE_BYTES) return Tritium.reply(msg.from, TEXT_IMAGE_TOO_BIG, msg.id);

            await Tritium.sendImage(msg.from, `data:image/png;base64,${processedImage.toString("base64")}`, "deepFried.png", "🔥🔥", msg.id);
        } catch (error) {
            Tritium.log(error);
            return Tritium.reply(msg.from, TEXT_ERROR_IMAGE_PROCESSING, msg.id);
        }
    },
    {
        triggers: ["deepfry", "df"],
        usage: "{command} (with quoted image)",
        description: "Deepfry an image.",
        cooldown: 10,
        groupOnly: true,
    },
);

function contrast(ctx, x, y, width, height) {
    const data = ctx.getImageData(x, y, width, height);
    const factor = 259 / 100 + 1;
    const intercept = 128 * (1 - factor);
    for (let i = 0; i < data.data.length; i += 4) {
        data.data[i] = data.data[i] * factor + intercept;
        data.data[i + 1] = data.data[i + 1] * factor + intercept;
        data.data[i + 2] = data.data[i + 2] * factor + intercept;
    }
    ctx.putImageData(data, x, y);
    return ctx;
}

function desaturate(ctx, level, x, y, width, height) {
    const data = ctx.getImageData(x, y, width, height);
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const dest = (i * width + j) * 4;
            const grey = Number.parseInt(0.2125 * data.data[dest] + 0.7154 * data.data[dest + 1] + 0.0721 * data.data[dest + 2], 10);
            data.data[dest] = level * (grey - data.data[dest]);
            data.data[dest + 1] = level * (grey - data.data[dest + 1]);
            data.data[dest + 2] = level * (grey - data.data[dest + 2]);
        }
    }
    ctx.putImageData(data, x, y);
    return ctx;
}
