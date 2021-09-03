const TritiumCommand = require("../../models/TritiumCommand");

const { decryptMedia } = require("@open-wa/wa-automate");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg }) {
    const isQuotedSticker = msg.quotedMsg && msg.quotedMsg.type === "sticker";
    if (!isQuotedSticker)
      return Tritium.reply(msg.from, `${msg.sender.pushname} quote a sticker, *you* !`, msg.id);

    const mediaData = await decryptMedia(msg.quotedMsg);
    const b64 = `data:${msg.quotedMsg.mimetype};base64,${mediaData.toString("base64")}`;
    await Tritium.sendFile(msg.from, b64, "img.png", "", msg.id);
  },
  {
    triggers: ["toimg", "stickertoimg", "stimg"],
    description: "Convert a sticker to an image.",
  },
);
