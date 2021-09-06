const TritiumCommand = require("../../models/TritiumCommand");
const { addMetadata } = require("../../utils/StickerMetadata");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { writeFileSync, statSync, readFileSync } = require("fs");
const mime = require("mime-types");
const nrc = require("node-cmd");
const Promise = require("bluebird");
const runAsync = Promise.promisify(nrc.get, { multiArgs: true, context: nrc });

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, args, cleanArgs }) {
        const isQuotedVideo = msg.quotedMsg && msg.quotedMsg.type === "video";
        if (!msg.isMedia && !isQuotedVideo) return Tritium.helpThisPoorMan(msg, this);

        const encryptedMedia = isQuotedVideo ? msg.quotedMsg : msg;
        const mimetype = isQuotedVideo ? msg.quotedMsg.mimetype : msg.mimetype;
        if (mime.extension(mimetype) !== "mp4") return Tritium.error("not mp4");

        try {
            const decryptedData = await decryptMedia(encryptedMedia);
            const result = await convertGifTransparentWebP(decryptedData);
            await Tritium.sendRawWebpAsSticker(msg.from, result).catch(() => Tritium.reply(msg.from, "The generated sticker was too big :/ Try with another one !", msg.id));
        } catch (error) {
            Tritium.error(error);
            Tritium.reply(msg.from, "*An error has occured because of this hecking image 😡*", msg.id);
        }
    },
    {
        triggers: ["transparentgif"],
        usage: "{command} (with quoted gif)",
        example: "{command} (with quoted gif)",
        description: "Makes a transparent sticker from a GIF.",

        cooldown: 12,
        groupOnly: true,
    },
);

async function convertGifTransparentWebP(imageData) {
    const random = Math.random().toString(36).substring(7);
    const tmpFileName = `./temp/sticker/convertGifTransparentWebP_${random}`;
    writeFileSync(`${tmpFileName}.mp4`, imageData);
    await runAsync(`ffmpeg -loglevel panic -i ${tmpFileName}.mp4 -r 10 -vcodec png ${tmpFileName}-%03d.png`);
    await runAsync(`for f in ${tmpFileName}-*.png; do convert $f -fuzz 10% -transparent white $f; done`);
    await runAsync(`convert -delay 10 -dispose Background ${tmpFileName}-*.png ${tmpFileName}.gif`); // 100/FPS = delay --> for 10 fps, 100/10 = 10 delay.
    await runAsync(`gif2webp ${tmpFileName}.gif -o ${tmpFileName}.webp`);
    console.log("convertGifTransparentWebP final size: " + Math.round(statSync(`${tmpFileName}.webp`).size / 1024) + " Ko");
    const result = readFileSync(`${tmpFileName}.webp`, { encoding: "base64" });
    await runAsync(`rm ${tmpFileName}.mp4 ${tmpFileName}-*.png ${tmpFileName}.gif ${tmpFileName}.webp`);
    return result;
}
