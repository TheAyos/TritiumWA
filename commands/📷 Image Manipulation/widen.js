const TritiumCommand = require("../../models/TritiumCommand");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { writeFileSync, readFileSync, existsSync, unlinkSync } = require("fs");
const { execSync } = require("child_process");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, args }) {
    const isQuotedImage = msg.quotedMsg && msg.quotedMsg.type === "image";
    if (!msg.isMedia && !isQuotedImage)
      return Tritium.reply(msg.from, `${msg.sender.pushname} send or quote an image !`, msg.id);
    const mediaData = await decryptMedia(isQuotedImage ? msg.quotedMsg : msg);
    const fileName = `./temp/${msg.from}_widen.webp`;
    try {
      writeFileSync(fileName, mediaData);
      execSync(`magick convert ${fileName} -resize 200x100!% ${fileName}`);
      const fatWidePutin = `data:image/webp;base64,${readFileSync(fileName, { encoding: "base64" })}`;
      await Tritium.sendFile(msg.from, fatWidePutin, "fatWidePutin.webp", "🍔🍔", msg.id);
    } catch (error) {
      console.log(error);
    } finally {
      try {
        // if (existsSync(fileName)) unlinkSync(fileName);
      } catch (error) {
        console.log("Widen: Unable to clean temp files:\n" + error);
      }
    }
  },
  {
    triggers: ["widen", "putin", "fatify", "🍔🍔"],
    usage: "{command} (with quoted image)",
    example: "",
    description: "Gotta make that image look ```W I D E E E```, _big ol' Putin would be proud 😿..._",

    cooldown: 10,
    groupOnly: true,
  },
);
