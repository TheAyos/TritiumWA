const TritiumCommand = require("../../models/TritiumCommand");

const { decryptMedia } = require("@open-wa/wa-automate");

const DYNAMIC_TEXT_QUOTE_STICKER = (name) => `${name} quote a sticker, *you* !`;

module.exports = new TritiumCommand(
    async function ({ Tritium, msg }) {
        const isQuotedSticker = msg.quotedMsg && msg.quotedMsg.type === "sticker";
        if (!isQuotedSticker) return Tritium.reply(msg.from, DYNAMIC_TEXT_QUOTE_STICKER(msg.sender.pushname), msg.id);

        const mediaData = await decryptMedia(msg.quotedMsg);
        const imageData64 = `data:${msg.quotedMsg.mimetype};base64,${mediaData.toString("base64")}`;
        await Tritium.sendFile(msg.from, imageData64, "toimg.png", "", msg.id);
    },
    {
        triggers: ["toimg", "stickertoimg"],
        description: "Convert a sticker to an image for your convenience, sir (or ma'am).",
    },
);
