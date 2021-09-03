const TritiumCommand = require("../../models/TritiumCommand");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { createCanvas, loadImage } = require("canvas");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg }) {
    const isQuotedImage = msg.quotedMsg && msg.quotedMsg.type === "image";
    if (!msg.isMedia && !isQuotedImage)
      return Tritium.reply(msg.from, `${msg.sender.pushname} send or quote an image !`, msg.id);

    const glassShatter = Tritium.fromRootPath("assets/images/glass_shatter.png");

    const encryptMedia = isQuotedImage ? msg.quotedMsg : msg;
    const mediaData = await decryptMedia(encryptMedia);

    const base = await loadImage(glassShatter);
    const data = await loadImage(mediaData);
    const canvas = createCanvas(data.width, data.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(data, 0, 0);
    ctx.drawImage(base, 0, 0, data.width, data.height);
    const attachment = canvas.toBuffer();

    if (Buffer.byteLength(attachment) > 15e6)
      return Tritium.reply(msg.from, "Resulting image was above 15 MB.", msg.id);

    await Tritium.sendImage(
      msg.from,
      `data:image/png;base64,${attachment.toString("base64")}`,
      "glass-shatter.png",
      "",
      msg.id,
    );
  },
  {
    triggers: ["shatter", "glass", "glass-shatter"],
    usage: "{command} (with quoted image)",
    description: "Draws an image with glass shatter in front of it !",

    cooldown: 10,
    groupOnly: true,
  },
);
