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

    // TODO: handle in new imgcmd class after
    if (!msg.isMedia && !isQuotedVideo) return Tritium.helpThisPoorMan(msg, this);

    const encryptedMedia = isQuotedVideo ? msg.quotedMsg : msg;
    const mimetype = isQuotedVideo ? msg.quotedMsg.mimetype : msg.mimetype;
    const name = Math.random().toString(36).substring(7);
    const tmpFileName = `./temp/sticker/${name}_${msg.from}`;

    try {
      const decryptedData = await decryptMedia(encryptedMedia);
      writeFileSync(`${tmpFileName}.${mime.extension(mimetype)}`, decryptedData);
      await runAsync(
        /* `ffmpeg -y -i ${tmpFileName}.mp4 -vf "fps=15,scale=320:-1:flags=lanczos" ${tmpFileName}.gif`,*/
        /* `ffmpeg -y -i ${tmpFileName}.mp4 -vf "fps=15" ${tmpFileName}.gif`,*/
        `ffmpeg -y -ss 0 -t 10 -i ${tmpFileName}.mp4 -vf "fps=15" ${tmpFileName}.gif`,
      );
      await runAsync(`ffmpeg -y -i ${tmpFileName}.gif -vf "select=eq(n\\,0)" ${tmpFileName}.png -f png`);

      /* await gifFrames({ url: `${tmpFileName}.gif`, frames: 0 }).then(function (frameData) {
          frameData[0].getImage().pipe(createWriteStream(`${tmpFileName}.png`));
        });*/

      await runAsync(`magick convert ${tmpFileName}.gif -coalesce -delete 0 ${tmpFileName}.gif`);
      // await runAsync(`convert ${tmpFileName}.gif -coalesce -delete 0 -layers optimize ${tmpFileName}.gif`);

      // magick convert -loop 0 -dispose 1 ./out.gif ./out.gif ??

      const dimensions = await sizeOf(`${tmpFileName}.gif`);
      let success = true;
      while (success) {
        await read(`${tmpFileName}.png`)
          .then((image) => {
            for (let i = 1; i < dimensions.width; i++) {
              for (let j = 1; j < dimensions.height; j++) {
                sleep(1);
                let colors = intToRGBA(image.getPixelColor(i, j));
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

                let hex = rgbaToInt(colors.r, colors.g, colors.b, colors.a);

                // sets the colour of that pixel
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
      console.log(dimensions.width + "  " + dimensions.height);
      if (dimensions.width < dimensions.height) {
        await runAsync(
          `magick mogrify -bordercolor transparent -border ${
            (dimensions.height - dimensions.width) / 2
          }x0 ${tmpFileName}.gif`,
        );
        await runAsync(
          `magick mogrify -bordercolor transparent -border ${
            (dimensions.height - dimensions.width) / 2
          }x0 ${tmpFileName}.png`,
        );
      } else if (dimensions.width > dimensions.height) {
        await runAsync(
          `magick mogrify -bordercolor transparent -border 0x${
            (dimensions.width - dimensions.height) / 2
          } ${tmpFileName}.gif`,
        );
        await runAsync(
          `magick mogrify -bordercolor transparent -border 0x${
            (dimensions.width - dimensions.height) / 2
          } ${tmpFileName}.png`,
        );
      }

      await runAsync(
        /* `convert ${tmpFileName}.png ${tmpFileName}.gif -resize 256x256 ${tmpFileName}.gif`,*/
        `magick convert ${tmpFileName}.png ${tmpFileName}.gif -gravity center -crop -1x256+0+0 ${tmpFileName}.gif`,
      );
      await runAsync(`gif2webp ${tmpFileName}.gif -o ${tmpFileName}.webp`);
      console.log("gifsticker size: " + Math.round(statSync(`${tmpFileName}.webp`).size / 1024) + " Ko");

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
        await addMetadata(`${tmpFileName}.webp`, pName, pAuthor);
      } else {
        await addMetadata(`${tmpFileName}.webp`, "theayos's", "Tritium Bot !");
      }

      try {
        const contents = readFileSync(`${tmpFileName}.webp`, { encoding: "base64" });
        await Tritium.sendRawWebpAsSticker(msg.from, contents);
      } catch (error) {
        // console.log(error + "\nerror :/ gifsticker too big: " + size + " Ko");
        return Tritium.reply(msg.from, "The generated sticker was too big :/ Try with another one !", msg.id);
      }
      // finished try {}
    } catch (error) {
      console.log(error);
      Tritium.reply(msg.from, "*An error has occured because of this hecking image 😡*", msg.id);
    } finally {
      try {
        /* if (existsSync(`${tmpFileName}.mp4`)) unlinkSync(`${tmpFileName}.mp4`);
        if (existsSync(`${tmpFileName}.gif`)) unlinkSync(`${tmpFileName}.gif`);
        if (existsSync(`${tmpFileName}.png`)) unlinkSync(`${tmpFileName}.png`);
        if (existsSync(`${tmpFileName}.webp`)) unlinkSync(`${tmpFileName}.webp`);*/
      } catch (e) {
        console.log("GifSticker: Unable to clean temp files:\n" + e);
      }
    }
  },
  {
    triggers: ["gifsticker", "stickergif", "sgif", "stikergif", "gifstiker"],
    usage: "{command} (with quoted gif)",
    example: "{command} (with quoted gif)",
    description: "Sends a sticker from quoted image. *CURRENTLY IN DEVELOPMENT*",

    cooldown: 17,
    groupOnly: true,
  },
);

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
