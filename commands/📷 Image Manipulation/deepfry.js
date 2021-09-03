const TritiumCommand = require("../../models/TritiumCommand");

const { decryptMedia } = require("@open-wa/wa-decrypt");
const { createCanvas, loadImage } = require("canvas");

module.exports = new TritiumCommand(
  async ({ Tritium, msg }) => {
    const isQuotedImage = msg.quotedMsg && msg.quotedMsg.type === "image";
    if (!msg.isMedia && !isQuotedImage)
      return Tritium.reply(msg.from, `${msg.sender.pushname} send or quote an image !`, msg.id);

    const encryptMedia = isQuotedImage ? msg.quotedMsg : msg;
    const mediaData = await decryptMedia(encryptMedia);

    const data = await loadImage(mediaData);
    const canvas = createCanvas(data.width, data.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(data, 0, 0);
    desaturate(ctx, -20, 0, 0, data.width, data.height);
    contrast(ctx, 0, 0, data.width, data.height);

    // convert aaa.png -liquid-rescale 50% -liquid-rescale 200% -modulate 50,200 -emboss 0x1.1 b.jpg +noise Gaussian -attenuate .5 b.jpg

    const attachment = canvas.toBuffer();
    if (Buffer.byteLength(attachment) > 15e6)
      return Tritium.reply(msg.from, "Resulting image was above 15 MB.", msg.id);

    await Tritium.sendImage(
      msg.from,
      `data:image/png;base64,${attachment.toString("base64")}`,
      "deepfried.png",
      "🔥🔥",
      msg.id,
    );
  },
  {
    triggers: ["deepfry", "df"],
    usage: "{command} (with quoted image)",
    description: "Deepfry an image.",
    cooldown: 10,
    groupOnly: true,
  },
);

function contrast(ctx, x, y, width, height) {
  const data = ctx.getImageData(x, y, width, height);
  const factor = 259 / 100 + 1;
  const intercept = 128 * (1 - factor);
  for (let i = 0; i < data.data.length; i += 4) {
    data.data[i] = data.data[i] * factor + intercept;
    data.data[i + 1] = data.data[i + 1] * factor + intercept;
    data.data[i + 2] = data.data[i + 2] * factor + intercept;
  }
  ctx.putImageData(data, x, y);
  return ctx;
}

function desaturate(ctx, level, x, y, width, height) {
  const data = ctx.getImageData(x, y, width, height);
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const dest = (i * width + j) * 4;
      const grey = Number.parseInt(
        0.2125 * data.data[dest] + 0.7154 * data.data[dest + 1] + 0.0721 * data.data[dest + 2],
        10,
      );
      data.data[dest] = level * (grey - data.data[dest]);
      data.data[dest + 1] = level * (grey - data.data[dest + 1]);
      data.data[dest + 2] = level * (grey - data.data[dest + 2]);
    }
  }
  ctx.putImageData(data, x, y);
  return ctx;
}
