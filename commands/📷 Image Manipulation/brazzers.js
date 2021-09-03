const TritiumCommand = require("../../models/TritiumCommand");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { createCanvas, loadImage } = require("canvas");

module.exports = new TritiumCommand(
  async ({ Tritium, msg }) => {
    const isQuotedImage = msg.quotedMsg && msg.quotedMsg.type === "image";
    if (!msg.isMedia && !isQuotedImage)
      return Tritium.reply(msg.from, `${msg.sender.pushname} send or quote an image !`, msg.id);

    const brazzersWatermark = Tritium.fromRootPath("assets/images/brazzers.png");
    Tritium.reply(msg.from, "_Your image is cuming 😉 !_", msg.id);

    const encryptMedia = isQuotedImage ? msg.quotedMsg : msg;
    const mediaData = await decryptMedia(encryptMedia);

    const base = await loadImage(brazzersWatermark);
    const data = await loadImage(mediaData);
    const canvas = createCanvas(data.width, data.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(data, 0, 0);
    const ratio = base.width / base.height;
    const width = data.width / 3;
    const height = Math.round(width / ratio);
    const padding = data.width / 50;
    ctx.drawImage(base, padding, data.height - height - padding, width, height);
    const attachment = canvas.toBuffer();
    if (Buffer.byteLength(attachment) > 15e6)
      return Tritium.reply(msg.from, "Resulting image was above 15 MB.", msg.id);

    await Tritium.sendImage(
      msg.from,
      `data:image/png;base64,${attachment.toString("base64")}`,
      "brazzers.png",
      "",
      msg.id,
    );
  },
  {
    triggers: ["brazzers", "bzz"],
    usage: "{command} (with quoted image)",
    description: "Add a Brazzers watermark to an image.",
    cooldown: 10,
    groupOnly: true,
  },
);
