const TritiumCommand = require("@models/TritiumCommand");
module.exports = new TritiumCommand(
  async ({ Tritium, msg, args }) => {
    await Tritium.sendLinkWithAutoPreview(
      msg.from,
      "*https://www.google.com/search?q=" + args.join("%20") + "*",
    );
  },
  {
    triggers: ["google", "googlesearch", "search", "gg"],
    usage: "{command} [search]",
    example: "{command} how to _pécho_",
    description: "Searches the web for you, majesty.",
    minArgs: 1,
    missingArgs: "Your query is empty 😦 (like ur hed?)",
  },
);
