const TritiumCommand = require("../../models/TritiumCommand");
const { parseArgsAndSetMetadataWebP } = require("../../utils/ImageTools");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { writeFileSync, statSync, readFileSync, unlinkSync, existsSync } = require("fs");
const { extension: mimeExtension } = require("mime-types");
const nrc = require("node-cmd");
const Promise = require("bluebird");
const runAsync = Promise.promisify(nrc.get, { multiArgs: true, context: nrc });

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, args, cleanArgs }) {
        const isQuotedVideo = msg.quotedMsg && msg.quotedMsg.type === "video";
        if (!msg.isMedia && !isQuotedVideo) return Tritium.helpThisPoorMan(msg, this);

        const mimetype = isQuotedVideo ? msg.quotedMsg.mimetype : msg.mimetype;
        if (mimeExtension(mimetype) !== "mp4") return Tritium.error("not mp4");

        const encryptedMedia = isQuotedVideo ? msg.quotedMsg : msg;
        try {
            const decryptedData = await decryptMedia(encryptedMedia);
            const name = Math.random().toString(36).substring(7);
            const tmpFileName = `./temp/sticker/${msg.from}_${name}`;
            writeFileSync(`${tmpFileName}.mp4`, decryptedData);

            await runAsync(`ffmpeg -loglevel panic -i ${tmpFileName}.mp4 -r 10 -vcodec png ${tmpFileName}-%03d.png`);
            await runAsync(`convert +dither -layers Optimize ${tmpFileName}-*.png GIF:- | gifsicle --no-warnings  --colors=64 --delay=10 --loop --optimize=3 --multifile - > ${tmpFileName}.gif`); // --colors 256 --delay=10 --loop --optimize=3
            await runAsync(`gif2webp ${tmpFileName}.gif -o ${tmpFileName}.webp`);
            console.log("gifify final webp size: " + Math.round(statSync(`${tmpFileName}.webp`).size / 1024) + " Ko");

            parseArgsAndSetMetadataWebP(`${tmpFileName}.webp`, args, cleanArgs);

            try {
                const contents = readFileSync(`${tmpFileName}.webp`, { encoding: "base64" });
                await Tritium.sendRawWebpAsSticker(msg.from, contents);
            } catch (error) {
                return Tritium.reply(msg.from, "The generated sticker was too big. WhatsApp only supports animated stickers less than 1MB :/ Try with another one !", msg.id);
            }

            await runAsync(`rm ${tmpFileName}-*.png`);
        } catch (error) {
            Tritium.error(error);
            Tritium.reply(msg.from, "*An error has occured because of this hecking image 😡*", msg.id);
        }
    },
    {
        triggers: ["gifify"],
        usage: "{command} (with quoted gif)",
        example: "{command} (with quoted gif)",
        description: "Sends a sticker from quoted image.",

        cooldown: 17,
        groupOnly: true,
    },
);
