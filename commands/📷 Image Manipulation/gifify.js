const TritiumCommand = require("../../models/TritiumCommand");
const { addMetadata } = require("../../utils/StickerMetadata");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { writeFileSync, createWriteStream, statSync, readFileSync, unlinkSync, existsSync } = require("fs");
const mime = require("mime-types");
// const gifFrames = require("gif-frames");
const sizeOf = require("image-size");
const { rgbaToInt, intToRGBA, read } = require("jimp");
const nrc = require("node-cmd");
const Promise = require("bluebird");
const runAsync = Promise.promisify(nrc.get, { multiArgs: true, context: nrc });

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, args, cleanArgs }) {
        const isQuotedVideo = msg.quotedMsg && msg.quotedMsg.type === "video";
        if (!msg.isMedia && !isQuotedVideo) return Tritium.helpThisPoorMan(msg, this);

        const encryptedMedia = isQuotedVideo ? msg.quotedMsg : msg;
        const mimetype = isQuotedVideo ? msg.quotedMsg.mimetype : msg.mimetype;
        const name = Math.random().toString(36).substring(7);
        const tmpFileName = `./temp/sticker/${msg.from}_${name}`;

        // generate gif is of nice quality but it's too big
        // `ffmpeg -y -ss 0 -t 10 -i ${tmpFileName}.mp4 -vf "fps=10,scale=256:-1,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 ${tmpFileName}.gif`
        // ffmpeg -t 5 -i 1.mp4 -vf "fps=10,scale=256:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 1ffmpeg.webp

        try {
            const decryptedData = await decryptMedia(encryptedMedia);
            writeFileSync(`${tmpFileName}.${mime.extension(mimetype)}`, decryptedData);
            console.log(`${tmpFileName}.${mime.extension(mimetype)}`);

            await runAsync(`ffmpeg -y -i ${tmpFileName}.mp4 -ss 0 -t 10 -vf "fps=10" ${tmpFileName}.gif`);
            await runAsync(`ffmpeg -y -i ${tmpFileName}.gif -vf "select=eq(n\\,0)" ${tmpFileName}.png -f png`);

            const dimensions = await sizeOf(`${tmpFileName}.gif`);
            let success = true;
            while (success) {
                await read(`${tmpFileName}.png`)
                    .then((image) => {
                        for (let i = 1; i < dimensions.width; i++) {
                            for (let j = 1; j < dimensions.height; j++) {
                                sleep(1);
                                const colors = intToRGBA(image.getPixelColor(i, j));
                                if (colors.r > 155) {
                                    colors.r = colors.r - 5;
                                } else {
                                    colors.r = colors.r + 5;
                                }
                                if (colors.g > 155) {
                                    colors.g = colors.g - 5;
                                } else {
                                    colors.g = colors.g + 5;
                                }
                                if (colors.b > 155) {
                                    colors.b = colors.b - 5;
                                } else {
                                    colors.b = colors.b + 5;
                                }
                                if (colors.a > 155) {
                                    colors.a = colors.a - 5;
                                } else {
                                    colors.a = colors.a + 5;
                                }

                                const hex = rgbaToInt(colors.r, colors.g, colors.b, colors.a);

                                // sets the colour of that pixel
                                image.setPixelColor(hex, i, j);
                                success = false;
                            }
                        }
                        image.write(`${tmpFileName}_processed.png`);
                    })
                    .catch((error) => {
                        console.log("ERROR: " + error);
                    });
            }

            await runAsync(`convert ${tmpFileName}.gif -coalesce -delete 0 ${tmpFileName}.gif`);
            await runAsync(`convert ${tmpFileName}.png ${tmpFileName}.gif -gravity center -crop -1x256+0+0 ${tmpFileName}.gif`);
            await runAsync(`gif2webp ${tmpFileName}.gif -o ${tmpFileName}.webp`);
            console.log("gifsticker final webp size: " + Math.round(statSync(`${tmpFileName}.webp`).size / 1024) + " Ko");

            try {
                const contents = readFileSync(`${tmpFileName}.webp`, { encoding: "base64" });
                await Tritium.sendRawWebpAsSticker(msg.from, contents);
            } catch (error) {
                return Tritium.reply(msg.from, "The generated sticker was too big :/ Try with another one !", msg.id);
            }

            // finished try {}
        } catch (error) {
            Tritium.error(error);
            Tritium.reply(msg.from, "*An error has occured because of this hecking image 😡*", msg.id);
        } finally {
            try {
                // if (existsSync(`${tmpFileName}.mp4`)) unlinkSync(`${tmpFileName}.mp4`);
                // if (existsSync(`${tmpFileName}.webp`)) unlinkSync(`${tmpFileName}.webp`);
            } catch (e) {
                console.log("GifSticker: Unable to clean temp files:\n" + e);
            }
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

function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
