const { DEFAULT_STICKERPACK_NAME, DEFAULT_STICKERPACK_AUTHOR } = require("../config.json");
const { addMetadata } = require("./StickerMetadata");

const { writeFileSync, statSync, readFileSync, existsSync } = require("fs");
const { imageSize } = require("image-size");
const nrc = require("node-cmd");
const Promise = require("bluebird");
const runAsync = Promise.promisify(nrc.get, { multiArgs: true, context: nrc });

class ImageTools {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated!`);
    }

    static async convertGifTransparentWebP(imageData) {
        if (!imageData) throw new TypeError(`Given image data is empty !`);
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

    static async convertGifTransparentWebPAndResize(imageData) {
        if (!imageData) throw new TypeError(`Given image data is empty !`);
        const random = Math.random().toString(36).substring(7);
        const tmpFileName = `./temp/sticker/convertGifTransparentWebP_${random}`;
        writeFileSync(`${tmpFileName}.mp4`, imageData);
        await runAsync(`ffmpeg -loglevel panic -i ${tmpFileName}.mp4 -r 10 -vcodec png ${tmpFileName}-%03d.png`);
        await runAsync(`for f in ${tmpFileName}-*.png; do convert $f -fuzz 10% -transparent white $f; done`);
        await runAsync(`convert -delay 10 -dispose Background ${tmpFileName}-*.png ${tmpFileName}.gif`);
        await ImageTools.cropAndResizeImageCorrectly(`${tmpFileName}.gif`, imageSize(`${tmpFileName}.gif`));
        await runAsync(`gif2webp ${tmpFileName}.gif -o ${tmpFileName}.webp`);
        console.log("convertGifTransparentWebP final size: " + Math.round(statSync(`${tmpFileName}.webp`).size / 1024) + " Ko");
        const result = readFileSync(`${tmpFileName}.webp`/* , { encoding: "base64" }*/);
        await runAsync(`rm ${tmpFileName}.mp4 ${tmpFileName}-*.png ${tmpFileName}.gif ${tmpFileName}.webp`);
        return result;
    }

    static async cropAndResizeImageCorrectly(imagePath, dimensions) {
        if (!existsSync(imagePath)) throw new TypeError(`Given image path doesn't exist ! '${imagePath}'`);
        console.log(dimensions.width + "x" + dimensions.height);
        if (dimensions.width < dimensions.height) {
            console.log(`height > width (image is taller than larger) => surround image with transparent border ${(dimensions.height - dimensions.width) / 2} pixels on left and right`);
            await runAsync(`mogrify -bordercolor transparent -border ${(dimensions.height - dimensions.width) / 2}x0 ${imagePath}`);
        } else if (dimensions.width > dimensions.height) {
            console.log(`width > height (image is larger than taller) => surround image with transparent border ${(dimensions.width - dimensions.height) / 2} pixels on top and bottom`);
            await runAsync(`mogrify -bordercolor transparent -border 0x${(dimensions.width - dimensions.height) / 2} ${imagePath}`);
        }
    }

    static async parseArgsAndSetMetadataWebP(imagePath, args, cleanArgs) {
        if (!imagePath.endsWith(".webp")) throw new TypeError("Incorrect file format supplied. Only WebP is supported.");
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
            await addMetadata(imagePath, pName, pAuthor);
        } else {
            await addMetadata(imagePath, DEFAULT_STICKERPACK_NAME, DEFAULT_STICKERPACK_AUTHOR);
        }
    }
}

module.exports = ImageTools;
