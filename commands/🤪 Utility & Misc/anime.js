const TritiumCommand = require("../../models/TritiumCommand");
const fetch = require("node-fetch");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, cleanArgs }) {
    const { jikan } = Tritium.utils;
    const query = cleanArgs;
    console.log("[Command request] (anime) " + query);

    let url = `${jikan}search/anime?q=${query}&limit=1`,
      settings = { method: "Get" };

    fetch(url, settings)
      .then((res) => res.json())
      .then(async (body, error) => {
        if (error) return console.log(error);
        if (!body.results) {
          return Tritium.reply(msg.from, `*Anime not found 😿!*`, msg.id);
        }
        let result = body.results[0];
        if (result.episodes === 0) result.episodes = "Unknown";
        let caption =
          "*_Anime found !_*\n\n" +
          `*✨ Title : ${result.title}*\n\n` +
          `*_⚜️ Type :_* ${result.type}\n` +
          `*❤️ Score :* ${result.score} | *🌟 Episodes :* ${result.episodes}\n\n` +
          `*🌠 Synopsis:* ${result.synopsis}\n\n` +
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
    triggers: ["anime", "animesearch"],
    usage: "{command} [search]",
    example: "{command} Doctor Stone",
    description: "Send anime info according to search.",

    cooldown: 10,
    minArgs: 1,
    missingArgs: "and what should i search for ?",
    groupOnly: true,
  },
);
