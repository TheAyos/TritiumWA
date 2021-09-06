const TritiumCommand = require("../../models/TritiumCommand");
module.exports = new TritiumCommand(
  async function ({ Tritium, msg, args }) {
    await Tritium.sendLinkWithAutoPreview(
      msg.from,
      "*https://www.google.com/search?q=" + encodeURIComponent(args.join(" ")) + "*",
    );
  },
  {
    triggers: ["google", "googlesearch", "search", "gg"],
    usage: "{command} [search]",
    example: "{command} how to pécho",
    description: "Searches the web for you, majesty.",
    minArgs: 1,
    missingArgs: "Your query is empty 😦",
    groupOnly: true,
  },
);
