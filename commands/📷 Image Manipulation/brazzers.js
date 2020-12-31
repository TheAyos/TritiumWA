const { decryptMedia } = require("@open-wa/wa-decrypt");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  triggers: ["brazzers", "bzz"],
  usage: "{command} (with quoted image)",
  example: "{command} (with quoted image)",
  description: "Adds a Brazzers watermark to an image.",

  isNSFW: false,
  needArgs: false,
  cooldown: 10,

  run: async function ({ Tritium, msg, args }) {
    const brazzersWatermark = Tritium.fromRootPath("assets/images/brazzers.png");

    try {
      const isQuotedImage = msg.quotedMsg && msg.quotedMsg.type === "image";
      if ((msg.isMedia || isQuotedImage) && args.length === 0) {
        Tritium.reply(msg.from, "_Your image is cuming 😉 !_", msg.id);
        Tritium.simulateTyping(msg.from, true);

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

        Tritium.simulateTyping(msg.from, false);
        await Tritium.sendImage(
          msg.from,
          `data:image/png;base64,${attachment.toString("base64")}`,
          "brazzers.png",
          "",
          msg.id,
        );
      }
    } catch (error) {
      Tritium.simulateTyping(msg.from, false);
      Tritium.reply(msg.from, `An error occurred: \`${err.message}\`. Try again later!`, msg.id);
      console.log(error);
    }
  },
};
