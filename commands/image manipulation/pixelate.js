const TritiumCommand = require("../../models/TritiumCommand");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { createCanvas, loadImage } = require("canvas");

const MAX_ALLOWED_FILESIZE_BYTES = 15 * 10e6;

const TEXT_IMAGE_TOO_BIG = `Resulting image was too big (> ${MAX_ALLOWED_FILESIZE_BYTES / 10e6} MB).`;
const TEXT_ERROR_IMAGE_PROCESSING = `I wasn't able to process the image correctly. Sorry budd.`;

const DYNAMIC_TEXT_SEND_OR_QUOTE_IMG = (name) => `${name} send or quote an image !`;

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
    return ((this - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

module.exports = new TritiumCommand(
    async ({ Tritium, msg, args }) => {
        const isQuotedImage = msg.quotedMsg && msg.quotedMsg.type === "image";
        if (!isQuotedImage) return Tritium.reply(msg.from, DYNAMIC_TEXT_SEND_OR_QUOTE_IMG(msg.sender.pushname), msg.id);

        let intensity = 15;

        if (args.length && (isNaN(args[0]) || args[0] < 1 || args[0] > 100)) return Tritium.reply(msg.from, "*Intensity must be a number between 1 and 100 😑*", msg.id);
        if (args.length) intensity = +args[0];

        try {
            const encryptMedia = isQuotedImage ? msg.quotedMsg : msg;
            const mediaData = await decryptMedia(encryptMedia);
            const data = await loadImage(mediaData);
            const canvas = createCanvas(data.width, data.height);
            const ctx = canvas.getContext("2d");

            const fw = (data.width / intensity) | 0;
            const fh = (data.height / intensity) | 0;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(data, 0, 0, fw, fh);
            ctx.drawImage(canvas, 0, 0, fw, fh, 0, 0, data.width, data.height);

            const processedImage = canvas.toBuffer();
            if (Buffer.byteLength(processedImage) > MAX_ALLOWED_FILESIZE_BYTES) return Tritium.reply(msg.from, TEXT_IMAGE_TOO_BIG, msg.id);

            await Tritium.sendImage(msg.from, `data:image/png;base64,${processedImage.toString("base64")}`, "pixelated.png", "👾👾", msg.id);
        } catch (error) {
            Tritium.log(error);
            return Tritium.reply(msg.from, TEXT_ERROR_IMAGE_PROCESSING, msg.id);
        }
    },
    {
        triggers: ["pixelate", "pix", "👾👾"],
        usage: ["{command} (with quoted image)", "{command} (with quoted image) <intensity>"],
        example: "{command} (with quoted image) 81",
        description: "Pixelate an image.",
        notice: "(default intensity is 15)",

        cooldown: 10,
        groupOnly: true,
    },
);
