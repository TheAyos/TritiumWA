const TritiumCommand = require("../../models/TritiumCommand");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { writeFileSync, readFileSync, existsSync, unlinkSync } = require("fs");
const { execSync } = require("child_process");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, args }) {
    const isQuotedImage = msg.quotedMsg && msg.quotedMsg.type === "image";

    // TODO: imagecmd class rand temp name && delete after !! :DDD
    // TODO: new ImageCommand class (or MediaCommand) //also these in class -> repeat less possible
    if (!msg.isMedia && !isQuotedImage)
      return Tritium.reply(msg.from, `${msg.sender.pushname} send or quote an image !`, msg.id);
    const mediaData = await decryptMedia(isQuotedImage ? msg.quotedMsg : msg);
    const fileName = `./temp/${msg.from}_tinyplanet.webp`;
    try {
      writeFileSync(fileName, mediaData);
      execSync(
        `magick convert ${fileName} -rotate 180 -virtual-pixel HorizontalTile -background white +distort Polar 0 +repage -rotate 180 ${fileName}`,
      );
      const cuteLittlePlanet = `data:image/webp;base64,${readFileSync(fileName, { encoding: "base64" })}`;
      await Tritium.sendFile(msg.from, cuteLittlePlanet, "cuteLittlePlanet.webp", "🥺🌍", msg.id);
    } catch (error) {
      console.log(error);
    } finally {
      try {
        // if (existsSync(fileName)) unlinkSync(fileName);
      } catch (error) {
        console.log("TinyPlanet: Unable to clean temp files:\n" + error);
      }
    }
  },
  {
    // TODO: add options ? /:D
    triggers: ["tinyplanet", "littleplanet", "planet", "🥺🌍", "🌍🥺"],
    usage: "{command} (with quoted image)",
    example: "",
    description: "Apply a _cuuute_ *🥺🌍 Tiny Planet 🥺🌍* effect to quoted image !",

    cooldown: 10,
    groupOnly: true,
  },
);
