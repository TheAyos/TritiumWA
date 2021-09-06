const TritiumCommand = require("../../models/TritiumCommand");

const { createCanvas, loadImage } = require("canvas");
const GIFEncoder = require("gifencoder");
const fetch = require("node-fetch");
const coord1 = [-25, -33, -42, -14];
const coord2 = [-25, -13, -34, -10];

const TEXT_ERROR_IMAGE_PROCESSING = `I wasn't able to process the image correctly. Sorry budd.`;
const TEXT_ERROR_NO_PROFILE_PIC_FOUND = `*🏜️ No profile pic found.*`;

module.exports = new TritiumCommand(
    async function ({ Tritium, msg }) {
        const target = !msg.mentionedJidList.length ? msg.sender.id : msg.mentionedJidList[0];

        const ppUrl = await Tritium.getProfilePicFromServer(target);
        if (!ppUrl || ppUrl.includes("ERROR")) return Tritium.reply(msg.from, TEXT_ERROR_NO_PROFILE_PIC_FOUND, msg.id);

        const triggeredImage = Tritium.fromRootPath("assets/images/triggered.png");

        try {
            const thatPp = await fetch(ppUrl);
            const buff = await thatPp.buffer();

            const base = await loadImage(triggeredImage);
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
            const bufferList = await streamToArray(stream);
            await Tritium.sendImageAsSticker(msg.from, `data:image/gif;base64,${Buffer.concat(bufferList).toString("base64")}`);
        } catch (error) {
            Tritium.log(error);
            return Tritium.reply(msg.from, TEXT_ERROR_IMAGE_PROCESSING, msg.id);
        }
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
