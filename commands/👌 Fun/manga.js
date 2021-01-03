const TritiumCommand = require("@models/TritiumCommand");
const fetch = require("node-fetch");

module.exports = new TritiumCommand(
  async ({ Tritium, msg, cleanArgs }) => {
    const { jikan } = Tritium.utils;
    const query = cleanArgs;
    console.log("[Command request] (manga) " + query);

    let url = `${jikan}search/manga?q=${query}&limit=1`,
      settings = { method: "Get" };

    fetch(url, settings)
      .then((res) => res.json())
      .then(async (body, error) => {
        if (error) return console.log(error);
        if (!body.results) {
          return Tritium.reply(msg.from, `*Manga not found 😿!*`, msg.id);
        }
        let result = body.results[0];
        if (result.volumes === 0) result.volumes = "Unknown";
        let caption =
          "*_Manga found !_*\n\n" +
          `*✨ Title : ${result.title}*\n\n` +
          `*_⚜️ Publishing :_* ${result.publishing ? "Yes !" : "No :/"}\n` +
          `*❤️ Score :* ${result.score} | *🌟 Volumes :* ${result.volumes}\n\n` +
          `*🌠 Synopsis :* ${result.synopsis}\n\n` +
          `*🌍 URL :*\n${result.url}`;

        await Tritium.sendFileFromUrl(
          msg.from,
          result.image_url,
          result.image_url.split("/").pop(),
          caption,
          msg.id,
        );
      });
  },
  {
    triggers: ["manga", "mangasearch"],
    usage: "{command} [search]",
    example: "{command} One Piece",
    description: "Send manga info according to search.",

    cooldown: 10,
    minArgs: 1,
    missingArgs: "and what should i search for, Baka ?",
  },
);
