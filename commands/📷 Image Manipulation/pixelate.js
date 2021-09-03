const TritiumCommand = require("../../models/TritiumCommand");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { createCanvas, loadImage } = require("canvas");

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return ((this - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

module.exports = new TritiumCommand(
  async ({ Tritium, msg, args }) => {
    const isQuotedImage = msg.quotedMsg && msg.quotedMsg.type === "image";
    if (!msg.isMedia && !isQuotedImage)
      return Tritium.reply(msg.from, `${msg.sender.pushname} send or quote an image !`, msg.id);

    let intensity = 50;

    if (args.length && (isNaN(args[0]) || args[0] < 1 || args[0] > 100))
      return Tritium.reply(msg.from, "*Intensity must be a number between 1 and 100 😑*", msg.id);
    if (args.length) intensity = +args[0];

    const encryptMedia = isQuotedImage ? msg.quotedMsg : msg;
    const mediaData = await decryptMedia(encryptMedia);

    const data = await loadImage(mediaData);
    const canvas = createCanvas(data.width, data.height);
    const ctx = canvas.getContext("2d");

    const fw = (data.width / intensity) | 0,
      fh = (data.height / intensity) | 0;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(data, 0, 0, fw, fh);
    ctx.drawImage(canvas, 0, 0, fw, fh, 0, 0, data.width, data.height);

    const attachment = canvas.toBuffer();
    if (Buffer.byteLength(attachment) > 15e6)
      return Tritium.reply(msg.from, "Resulting image was above 15 MB.", msg.id);

    await Tritium.sendImage(
      msg.from,
      `data:image/png;base64,${attachment.toString("base64")}`,
      "pixelated.png",
      "👾👾",
      msg.id,
    );
  },
  {
    triggers: ["pixelate", "pix", "👾👾"],
    usage: ["{command} (with quoted image)", "{command} (with quoted image) <intensity>"],
    example: "{command} (with quoted image) 81",
    description: "Pixelate an image.",
    notice: "(default intensity is 50)",

    cooldown: 10,
    groupOnly: true,
  },
);
