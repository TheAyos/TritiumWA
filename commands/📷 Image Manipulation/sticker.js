const TritiumCommand = require("../../models/TritiumCommand");
const { DEFAULT_STICKERPACK_NAME, DEFAULT_STICKERPACK_AUTHOR } = require("../../config.json");

const { decryptMedia } = require("@open-wa/wa-decrypt");

const TEXT_ERROR_IMAGE_PROCESSING = `I wasn't able to process the image correctly. Sorry budd.`;

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, args, cleanArgs }) {
        const isQuotedImage = msg.quotedMsg && msg.quotedMsg.type === "image";
        if (!msg.isMedia && !isQuotedImage) return Tritium.reply(msg.from, `${msg.sender.pushname} send or quote an image !`, msg.id);

        try {
            const encryptMedia = isQuotedImage ? msg.quotedMsg : msg;
            const mediaData = await decryptMedia(encryptMedia);

            let circle = false,
                keepScale = true;

            if (args[0] === "circle") {
                circle = true;
                args.shift();
                cleanArgs.split(" ").splice(0, 1).join(" ");
            } else if (args[0] === "fit") {
                keepScale = false;
                args.shift();
                cleanArgs.split(" ").splice(0, 1).join(" ");
            }

            if (args.length) {
                let pName = "",
                    pAuthor = "";
                if (args.length === 1) pName = args[0];
                else if (args.length > 1) {
                    cleanArgs = cleanArgs.indexOf("|") > -1 ? cleanArgs.split("|") : args;
                    pName = cleanArgs.shift().trim();
                    pAuthor = cleanArgs.shift().trim();
                    console.log(pName, pAuthor);
                }
                await Tritium.sendImageAsSticker(msg.from, mediaData, { author: pAuthor, pack: pName, circle: circle, keepScale: keepScale });
            } else {
                await Tritium.sendImageAsSticker(msg.from, mediaData, { author: DEFAULT_STICKERPACK_AUTHOR, pack: DEFAULT_STICKERPACK_NAME, circle: circle, keepScale: keepScale });
            }
        } catch (error) {
            Tritium.log(error);
            return Tritium.reply(msg.from, TEXT_ERROR_IMAGE_PROCESSING, msg.id);
        }
    },
    {
        triggers: ["sticker", "s", "stiker"],
        usage: "{command} (with quoted image) <circle OR fit> <sticker name> | <sticker author>",
        example: ["{command} (with quoted image) fit", "{command} (with quoted image) circle theayos's | tritium bot"],
        description: "Sends a sticker from quoted image.",

        cooldown: 10,
        groupOnly: true,
    },
);

/*

const TritiumCommand = require("../../models/TritiumCommand");
const { addMetadata } = require("../../utils/StickerMetadata");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { writeFileSync, readFileSync } = require("fs");
const { execSync } = require("child_process");

const TEXT_ERROR_IMAGE_PROCESSING = `I wasn't able to process the image correctly. Sorry budd.`;

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, args, cleanArgs }) {
        const isQuotedImage = msg.quotedMsg && msg.quotedMsg.type === "image";
        if (!msg.isMedia && !isQuotedImage) return Tritium.reply(msg.from, `${msg.sender.pushname} send or quote an image !`, msg.id);

        try {
            if (args.length === 0) {
                // crop
                const encryptMedia = isQuotedImage ? msg.quotedMsg : msg;
                const _mimetype = isQuotedImage ? msg.quotedMsg.mimetype : msg.mimetype;
                const mediaData = await decryptMedia(encryptMedia);
                const imageBase64 = `data:${_mimetype};base64,${mediaData.toString("base64")}`;
                await Tritium.sendImageAsSticker(msg.from, imageBase64);
            } else if (args.length) {
                const mediaData = await decryptMedia(isQuotedImage ? msg.quotedMsg : msg);
                const fileName = `./temp/sticker/${msg.from}_sticker.webp`;
                writeFileSync(fileName, mediaData);
                // execSync(`convert ${fileName} -quality 50 -define webp:lossless=false ${fileName}`);
                // execSync(`convert ${fileName} -define webp -gravity center -crop -1x512+0+0 ${fileName}`);
                execSync(`convert ${fileName} -define webp ${fileName}`);
                let pName = "",
                    pAuthor = "";
                if (args.length === 1) pName = args[0];
                else if (args.length > 1) {
                    cleanArgs = cleanArgs.indexOf("|") > -1 ? cleanArgs.split("|") : args;
                    pName = cleanArgs.shift().trim();
                    pAuthor = cleanArgs.shift().trim();
                    console.log(pName, pAuthor);
                }
                await addMetadata(fileName, pName, pAuthor);
                const veryBeautifulSticker = readFileSync(fileName, { encoding: "base64" });
                await Tritium.sendRawWebpAsSticker(msg.from, veryBeautifulSticker);
            } else {
                return Tritium.helpThisPoorMan(msg, this);
            }
        } catch (error) {
            Tritium.log(error);
            return Tritium.reply(msg.from, TEXT_ERROR_IMAGE_PROCESSING, msg.id);
        }
    },
    {
        triggers: ["sticker", "s", "stiker"],
        usage: "{command} (with quoted image) <sticker name> | <sticker author>",
        example: ["{command} (with quoted image)", "{command} (with quoted image) theayos's | tritium bot"],
        description: "Sends a sticker from quoted image.",

        cooldown: 10,
        groupOnly: true,
    },
);
*/
