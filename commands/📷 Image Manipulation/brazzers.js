const gm = require("@tohru/gm").subClass({
    imageMagick: true,
});
const { decryptMedia } = require("@open-wa/wa-decrypt");

module.exports = {
    triggers: ["brazzers", "bzz"],
    usage: "{command} (with quoted image)",
    example: "{command} (with quoted image)",
    description: "Adds a Brazzers watermark to an image.",

    isNSFW: false,
    needArgs: false,
    cooldown: 10,

    run: async function ({ Tritium, message, args }) {
        const brazzersWatermark = Tritium.fromRootPath("./assets/images/bzzwatermark.png");
        const WMStrm = Tritium.utils.WMStrm;

        try {
            const isQuotedImage = message.quotedMsg && message.quotedMsg.type === "image";
            if ((message.isMedia || isQuotedImage) && args.length === 0) {
                Tritium.reply(message.from, "_Your image is cuming 😉 !_", message.id);
                Tritium.simulateTyping(message.from, true);

                const encryptMedia = isQuotedImage ? message.quotedMsg : message;
                const mediaData = await decryptMedia(encryptMedia);
                var wstream = new WMStrm("data");

                gm(mediaData).size((error, size) => {
                    if (error) throw new Error(error);
                    gm(mediaData)
                        .composite(brazzersWatermark)
                        .gravity("SouthEast")
                        .resize(size.width, null)
                        .strip()
                        .stream("png")
                        .pipe(wstream)
                        .on("finish", async () => {
                            console.log("finished writing");
                            Tritium.simulateTyping(message.from, false);
                            await Tritium.sendImage(
                                message.from,
                                `data:image/png;base64,${wstream._memStore.data.toString(
                                    "base64",
                                )}`,
                                "brazzers.png",
                                "",
                                message.id,
                            ).catch((e) => {
                                Tritium.simulateTyping(msg.from, false);
                                Tritium.reply(message.from, "Erreur :( ", message.id);
                                console.log(e);
                            });
                            wstream.end();
                        });
                });
            }
        } catch (error) {
            Tritium.simulateTyping(message.from, false);
            console.log(error);
        }
    },
};
