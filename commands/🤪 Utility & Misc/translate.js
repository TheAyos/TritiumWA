const TritiumCommand = require("../../models/TritiumCommand");

const fetch = require("node-fetch");

module.exports = new TritiumCommand(
  async ({ Tritium, msg, args, cleanArgs }) => {
    let text;
    const target = args[0];

    /* let text = msg.type === "chat" && body.startsWith(prefix)
    ? body
    : msg.type === "image" || msg.type === "video"
    ? msg.caption*/

    // if (!msg.quotedMsg && !args.length > 0) return Tritium.helpThisPoorMan(msg, this);

    // .trad fr text
    if (args.length > 1) {
      args.shift();
      // if (!args.length) return Tritium.reply(msg.from, "You didn't give any text !", msg.id);
      text = args.join(" ");
    } else if (args.length === 1 && msg.quotedMsg) {
      text =
        msg.type === "chat"
          ? msg.quotedMsgObj.body
          : msg.type === "image" || msg.type === "video"
          ? msg.quotedMsgObj.caption
          : "";

      // text = msg.quotedMsg.body ?? msg.quotedMsgObj.caption;
      if (!text) return Tritium.reply(msg.from, "Quoted message has no text !", msg.id);
    } else {
      return Tritium.helpThisPoorMan(msg, this.name);
    }

    const translatedText = await Trenatlas(text, target);

    console.log("TRAD => ", target, text);
    console.log("TRAD => ", target, translatedText);

    if (!translatedText)
      return Tritium.reply(msg.from, "Error. Check if you are using a correct language code !", msg.id);

    return Tritium.reply(msg.from, `${translatedText}`, msg.id);
  },
  {
    triggers: ["translate", "trans", "trad"],
    description: "Translate a quoted message or given text.",
    usage: ["{command} [language code] (with quoted message)", "{command} [language code] [text]"],

    groupOnly: true,
    cooldown: 10,
  },
);

async function Trenatlas(sourceText, target = "en", source = "auto") {
  if (!target || !target.length) target = "en";
  if (!source || !source.length) source = "auto";

  const text = sourceText.replace(/\*/g, "").replace(/\_/g, "").replace(/\`/g, "");
  const url =
    `https://script.google.com/macros/s/AKfycbwzT4rDHQrzxjbuPQHIfDrc4EKdhSV5OUkBSZI9BFGTG2Qsusggm-KQ/exec?q=` +
    `${encodeURIComponent(text)}&source=${source}&target=${target}`;
  do {
    const res = await fetch(url, { method: "Get" });
    var result = await res.json().catch((e) => {
      result = undefined;
      if (!e.message.includes("json")) console.error(e.message);
    });
  } while (!result);

  return result ? result.translatedText : "";
}
