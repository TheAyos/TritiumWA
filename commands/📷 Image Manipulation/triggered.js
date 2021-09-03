const TritiumCommand = require("../../models/TritiumCommand");

const { createCanvas, loadImage } = require("canvas");
const GIFEncoder = require("gifencoder");
const fetch = require("node-fetch");
const coord1 = [-25, -33, -42, -14];
const coord2 = [-25, -13, -34, -10];

module.exports = new TritiumCommand(
  async function ({ Tritium, msg }) {
    let target, ppUrl;

    if (!msg.mentionedJidList.length) target = msg.sender.id;
    else target = msg.mentionedJidList[0];

    ppUrl = await Tritium.getProfilePicFromServer(target);
    if (!ppUrl) return Tritium.reply(msg.from, "*🏜️ No profile pic found.*", msg.id);

    const thatPp = await fetch(ppUrl);
    const buff = await thatPp.buffer();

    const base = await loadImage(Tritium.fromRootPath("assets/images/triggered.png"));
    const avatar = await loadImage(buff);
    const encoder = new GIFEncoder(base.width, base.width);
    const canvas = createCanvas(base.width, base.width);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, base.width, base.width);
    const stream = encoder.createReadStream();
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(50);
    encoder.setQuality(200);
    for (let i = 0; i < 4; i++) {
      drawImageWithTint(ctx, avatar, "red", coord1[i], coord2[i], 300, 300);
      ctx.drawImage(base, 0, 218, 256, 38);
      encoder.addFrame(ctx);
    }
    encoder.finish();
    const buffer = await streamToArray(stream);
    Tritium.sendImageAsSticker(msg.from, `data:image/gif;base64,${Buffer.concat(buffer).toString("base64")}`);
  },
  {
    triggers: ["triggered"],
    usage: ["{command} <User mention>"],
    example: ["{command} @☄️ζ͜͡𝗧𝗿𝗶𝘁𝗶𝘂𝗺꠸"],
    description: 'Makes a user\'s profile pic in a "Triggered" meme !',

    cooldown: 25,
    groupOnly: true,
  },
);

function streamToArray(stream) {
  if (!stream.readable) return Promise.resolve([]);
  return new Promise((resolve, reject) => {
    const array = [];
    function onData(data) {
      array.push(data);
    }
    function onEnd(error) {
      if (error) reject(error);
      else resolve(array);
      cleanup();
    }
    function onClose() {
      resolve(array);
      cleanup();
    }
    function cleanup() {
      stream.removeListener("data", onData);
      stream.removeListener("end", onEnd);
      stream.removeListener("error", onEnd);
      stream.removeListener("close", onClose);
    }
    stream.on("data", onData);
    stream.on("end", onEnd);
    stream.on("error", onEnd);
    stream.on("close", onClose);
  });
}

function drawImageWithTint(ctx, image, color, x, y, width, height) {
  const { fillStyle, globalAlpha } = ctx;
  ctx.fillStyle = color;
  ctx.drawImage(image, x, y, width, height);
  ctx.globalAlpha = 0.5;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = fillStyle;
  ctx.globalAlpha = globalAlpha;
}
