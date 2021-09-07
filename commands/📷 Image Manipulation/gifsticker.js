const TritiumCommand = require("../../models/TritiumCommand");
const { cropAndResizeImageCorrectly, parseArgsAndSetMetadataWebP } = require("../../utils/ImageTools");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { writeFileSync, statSync, readFileSync } = require("fs");
const mime = require("mime-types");
const sizeOf = require("image-size");
const { rgbaToInt, intToRGBA, read } = require("jimp");

const nrc = require("node-cmd");
const Promise = require("bluebird");
const runAsync = Promise.promisify(nrc.get, { multiArgs: true, context: nrc });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, args, cleanArgs }) {
        const isQuotedVideo = msg.quotedMsg && msg.quotedMsg.type === "video";
        if (!msg.isMedia && !isQuotedVideo) return Tritium.helpThisPoorMan(msg, this);

        const encryptedMedia = isQuotedVideo ? msg.quotedMsg : msg;
        const mimetype = isQuotedVideo ? msg.quotedMsg.mimetype : msg.mimetype;
        const name = Math.random().toString(36).substring(7);
        const tmpFileName = `./temp/sticker/${name}_${msg.from}`;

        try {
            const decryptedData = await decryptMedia(encryptedMedia);
            writeFileSync(`${tmpFileName}.${mime.extension(mimetype)}`, decryptedData);

            await runAsync(`ffmpeg -y -ss 0 -t 10 -i ${tmpFileName}.mp4 -vf "fps=15" ${tmpFileName}.gif`);
            await runAsync(`ffmpeg -y -i ${tmpFileName}.gif -vf "select=eq(n\\,0)" ${tmpFileName}.png -f png`);
            await runAsync(`convert ${tmpFileName}.gif -coalesce -delete 0 ${tmpFileName}.gif`);

            const dimensions = await sizeOf(`${tmpFileName}.gif`);
            let success = true;
            while (success) {
                await read(`${tmpFileName}.png`)
                    .then((image) => {
                        for (let i = 1; i < dimensions.width; i++) {
                            for (let j = 1; j < dimensions.height; j++) {
                                // sleep(1);
                                const colors = intToRGBA(image.getPixelColor(i, j));
                                if (colors.r > 155) colors.r = colors.r - 5;
                                else colors.r = colors.r + 5;

                                if (colors.g > 155) colors.g = colors.g - 5;
                                else colors.g = colors.g + 5;

                                if (colors.b > 155) colors.b = colors.b - 5;
                                else colors.b = colors.b + 5;

                                if (colors.a > 155) colors.a = colors.a - 5;
                                else colors.a = colors.a + 5;

                                const hex = rgbaToInt(colors.r, colors.g, colors.b, colors.a);
                                image.setPixelColor(hex, i, j);
                                success = false;
                            }
                        }
                        image.write(`${tmpFileName}.png`);
                    })
                    .catch((error) => {
                        console.log("ERROR: " + error);
                    });
            }

            await cropAndResizeImageCorrectly(`${tmpFileName}.gif`, dimensions);
            await cropAndResizeImageCorrectly(`${tmpFileName}.png`, dimensions);

            /* `convert ${tmpFileName}.png ${tmpFileName}.gif -resize 256x256 ${tmpFileName}.gif`,*/
            await runAsync(`convert ${tmpFileName}.png ${tmpFileName}.gif -gravity center -crop -1x256+0+0 ${tmpFileName}.gif`);
            await runAsync(`gif2webp ${tmpFileName}.gif -o ${tmpFileName}.webp`);
            console.log("gifsticker final webp size: " + Math.round(statSync(`${tmpFileName}.webp`).size / 1024) + " Ko");

            parseArgsAndSetMetadataWebP(`${tmpFileName}.webp`, args, cleanArgs);

            try {
                const contents = readFileSync(`${tmpFileName}.webp`, { encoding: "base64" });
                await Tritium.sendRawWebpAsSticker(msg.from, contents);
            } catch (error) {
                return Tritium.reply(msg.from, "The generated sticker was too big :/ Try with another one !", msg.id);
            }
        } catch (error) {
            console.log(error);
            Tritium.reply(msg.from, "*An error has occured because of this hecking image 😡*", msg.id);
        }
    },
    {
        triggers: ["gifsticker", "stickergif", "sgif", "stikergif", "gifstiker"],
        usage: "{command} (with quoted gif)",
        example: "{command} (with quoted gif)",
        description: "Sends a sticker from quoted image.",

        cooldown: 20,
        groupOnly: true,
    },
);

/*
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);
async function getImageDimensions(imagePath) {
    const dimensions = await exec(`convert ${imagePath} -format "%wx%h" info:`);
    console.log(dimensions);
    console.log(dimensions.replace("\n", "").split("x"));
    return { width: +dimensions[0], height: +dimensions[1] };
}
*/
