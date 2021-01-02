const TritiumCommand = require("@models/TritiumCommand");
const { decryptMedia } = require("@open-wa/wa-decrypt");
const { exec } = require("child_process");
const fs = require("fs");
//const nrc = require('node-run-cmd')

module.exports = new TritiumCommand(
  async ({ Tritium, msg, args }) => {
    const isQuotedImage = msg.quotedMsg && msg.quotedMsg.type === "image";
    try {
      if ((msg.isMedia || isQuotedImage) && args.length === 0) {
        Tritium.reply(msg.from, "🦅 Sticker coming... ", msg.id);
        const encryptMedia = isQuotedImage ? msg.quotedMsg : msg;
        const _mimetype = isQuotedImage ? msg.quotedMsg.mimetype : msg.mimetype;
        const mediaData = await decryptMedia(encryptMedia);
        const imageBase64 = `data:${_mimetype};base64,${mediaData.toString("base64")}`;
        //const fileName = `./${msg.from}.webp`
        //await fs.writeFileSync(fileName, mediaData)
        //await exec(`webpmux -set exif STK-20201118-WA0114.webp ${fileName} -o ${fileName}`)
        //const contents = await fs.readFileSync(`./${msg.from}.webp`, { encoding: 'base64' })
        //const contents = await fs.readFileSync(fileName, { encoding: 'base64' })
        await Tritium.sendImageAsSticker(msg.from, imageBase64);
        Tritium.reply(msg.from, "Here's your sticker");
        //await Tritium.sendRawWebpAsSticker(msg.from, contents)
        //Tritium.reply(msg.from, 'Here\'s your sticker')
      } else {
        return Tritium.reply(msg.from, `${msg.sender.pushname} send or quote an image, idiot !`, msg.id);
      }
    } catch (error) {
      console.log(error);
    }
  },
  {
    triggers: ["sticker" /*, 'gifsticker'*/],
    usage: "{command} (with quoted image)",
    example: "{command} (with quoted image)",
    description: "Sends a sticker from quoted image. *CURRENTLY IN DEVELOPMENT*",

    cooldown: 10,
  },
);
