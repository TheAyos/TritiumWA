module.exports = {
  triggers: ["fisheye", "fish-eye", "explode"],
  usage: "{command} (with quoted image)\n" + "{command} (with quoted image) <intensity>",
  example: "{command} (with quoted image)\n" + "{command} (with quoted image) 5",
  description: "Gotta make that image THICC. _(default intensity is 50)_",

  groupOnly: false,
  isNSFW: false,
  cooldown: 10,
  needArgs: false,

  args: [
    {
      optional: true,
      key: "intensity",
      prompt: "How strong do you want the distorsion effect to be?",
      type: "number",
    },
    {
      optional: false,
      key: "image",
      prompt: "The image you want to apply the effect on.",
      type: "image", // could be a quoted image or a captionned image
    },
    {
      key: "image",
      prompt: "How strong do you want the distorsion effect to be?",
      type: "image",
    },
  ],

  run: async function ({ Tritium, message, args }) {
    const { decryptMedia } = require("@open-wa/wa-decrypt");
    const { loadImage, createCanvas } = require("canvas");
    const isQuotedImage = message.quotedMsg && message.quotedMsg.type === "image";

    try {
      let intensity = 50;

      if ((message.isMedia || isQuotedImage) && args.length <= 1) {
        if (args.length === 1 && (isNaN(args[0]) || args[0] < -1000 || args[0] > 1000)) {
          return Tritium.reply(
            message.from,
            "*Argument must be a number between 0 and ±1000 😑*",
            message.id,
          );
        } else if (args.length === 1) {
          intensity = +args[0]; // to int
        }

        Tritium.simulateTyping(message.from, true);
        const encryptMedia = isQuotedImage ? message.quotedMsg : message;
        const _mimetype = isQuotedImage ? message.quotedMsg.mimetype : message.mimetype;
        const mediaData = await decryptMedia(encryptMedia);

        const data = await loadImage(`data:${_mimetype};base64,${mediaData.toString("base64")}`);

        const canvas = createCanvas(data.width, data.height);
        const ctx = canvas.getContext("2d");
        await ctx.drawImage(data, 0, 0);
        await fishEye(ctx, intensity, 0, 0, data.width, data.height);
        const processedImage = canvas.toBuffer();
        Tritium.simulateTyping(message.from, false);
        if (Buffer.byteLength(processedImage) > 8e6)
          return Tritium.reply(message.from, "The file is way too big for me to upload it.", message.id);

        Tritium.sendImage(
          message.from,
          `data:${_mimetype};base64,${processedImage.toString("base64")}`,
          "fisheye.png",
          "",
          message.id,
        );
      } else {
        Tritium.helpThisPoorMan(message, this);
        //return Tritium.reply(message.from, 'Send or quote an image !', message.id);
      }
    } catch (error) {
      Tritium.simulateTyping(message.from, false);
      console.log(error);
    }
  },
};
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
