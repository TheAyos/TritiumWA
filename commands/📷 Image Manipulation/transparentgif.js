const TritiumCommand = require("../../models/TritiumCommand");
const { convertGifTransparentWebPAndResize, parseArgsAndSetMetadataWebP } = require("../../utils/ImageTools");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { extension: mimeExtension } = require("mime-types");
const { writeFileSync, statSync, readFileSync, unlinkSync, existsSync } = require("fs");

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, args, cleanArgs }) {
        // const isQuotedVideo = msg.quotedMsg && msg.quotedMsg.type === "video";
        // if (!msg.isMedia && !isQuotedVideo) return Tritium.helpThisPoorMan(msg, this);
        if (!msg._hasQuotedVideo) return Tritium.helpThisPoorMan(msg, this);

        // const mimetype = msg._hasQuotedVideo ? msg.quotedMsg.mimetype : msg.mimetype;
        if (mimeExtension(msg._mediaMimetype) !== "mp4") return Tritium.error("not mp4");

        const encryptedMedia = msg._hasQuotedVideo ? msg.quotedMsg : msg;
        try {
            const decryptedData = await decryptMedia(encryptedMedia);
            const name = Math.random().toString(36).substring(7);
            const fileName = `./temp/sticker/${msg.from}_${name}_transparentgif.webp`;

            let result = await convertGifTransparentWebPAndResize(decryptedData);
            writeFileSync(fileName, result);
            parseArgsAndSetMetadataWebP(fileName, args, cleanArgs);
            result = readFileSync(fileName, { encoding: "base64" });
            console.log("transparentgif final webp size: " + Math.round(statSync(fileName).size / 1024) + " Ko");

            await Tritium.sendRawWebpAsSticker(msg.from, result).catch(() => Tritium.reply(msg.from, "The generated sticker was too big :/ Try with another one !", msg.id));
            if (existsSync(fileName)) unlinkSync(fileName);
        } catch (error) {
            Tritium.error(error);
            Tritium.reply(msg.from, "*An error has occured because of this hecking image 😡*", msg.id);
        }
    },
    {
        triggers: ["transparentgif", "tg"],
        usage: "{command} (with quoted gif)",
        example: "{command} (with quoted gif)",
        description: "Makes a transparent sticker from a GIF.",

        cooldown: 12,
        groupOnly: true,
    },
);
