const TritiumCommand = require("../../models/TritiumCommand");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { loadImage, createCanvas } = require("canvas");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, args }) {
    const isQuotedImage = msg.quotedMsg && msg.quotedMsg.type === "image";

    try {
      let intensity = 50;

      if ((msg.isMedia || isQuotedImage) && args.length <= 1) {
        if (args.length === 1 && (isNaN(args[0]) || args[0] < -1000 || args[0] > 1000 || args[0] === 0)) {
          return Tritium.reply(msg.from, "*Intensity must be a number between ±1 and ±1000 😑*", msg.id);
        } else if (args.length === 1) {
          intensity = +args[0]; // to int
        }

        const encryptMedia = isQuotedImage ? msg.quotedMsg : msg;
        const _mimetype = isQuotedImage ? msg.quotedMsg.mimetype : msg.mimetype;
        const mediaData = await decryptMedia(encryptMedia);

        const data = await loadImage(`data:${_mimetype};base64,${mediaData.toString("base64")}`);

        const canvas = createCanvas(data.width, data.height);
        const ctx = canvas.getContext("2d");
        await ctx.drawImage(data, 0, 0);
        await fishEye(ctx, intensity, 0, 0, data.width, data.height);
        const processedImage = canvas.toBuffer();
        if (Buffer.byteLength(processedImage) > 8e6)
          return Tritium.reply(msg.from, "The file is way too big for me to upload it.", msg.id);

        Tritium.sendImage(
          msg.from,
          `data:${_mimetype};base64,${processedImage.toString("base64")}`,
          "fisheye.png",
          "",
          msg.id,
        );
      } else {
        await Tritium.reply(msg.from, `${msg.sender.pushname} send or quote an image !`, msg.id);
        return Tritium.helpThisPoorMan(msg, this);
      }
    } catch (error) {
      console.log(error);
    }
  },
  {
    triggers: ["fisheye", "fish-eye", "explode", "fe"],
    usage: ["{command} (with quoted image)", "{command} (with quoted image) <intensity>"],
    example: ["{command} (with quoted image) 5"],
    description: "Gotta make that image look _*THICC*_.",
    notice: "(default intensity is 50)",

    cooldown: 10,
    groupOnly: true,
  },
);

async function fishEye(ctx, intensity, x, y, width, height) {
  const frame = ctx.getImageData(x, y, width, height);

  const source = new Uint8Array(frame.data);
  for (let i = 0; i < frame.data.length; i += 4) {
    const sx = (i / 4) % frame.width;

    const sy = Math.floor(i / 4 / frame.width);
    const dx = Math.floor(frame.width / 2) - sx;

    const dy = Math.floor(frame.height / 2) - sy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const x2 = Math.round(frame.width / 2 - dx * Math.sin(dist / (intensity * Math.PI) / 2));

    const y2 = Math.round(frame.height / 2 - dy * Math.sin(dist / (intensity * Math.PI) / 2));

    const i2 = (y2 * frame.width + x2) * 4;

    frame.data[i] = source[i2];
    frame.data[i + 1] = source[i2 + 1];
    frame.data[i + 2] = source[i2 + 2];
    frame.data[i + 3] = source[i2 + 3];
  }

  ctx.putImageData(frame, x, y);
  return ctx;
}
