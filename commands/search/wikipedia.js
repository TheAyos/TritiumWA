const TritiumCommand = require("../../models/TritiumCommand");

const fetch = require("node-fetch");

const { URL, URLSearchParams } = require("url");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, cleanArgs }) {
    try {
      const url = new URL("https://en.wikipedia.org/w/api.php");
      url.search = new URLSearchParams({
        action: "query",
        prop: "extracts|pageimages",
        format: "json",
        titles: cleanArgs,
        exintro: "",
        explaintext: "",
        pithumbsize: 150,
        redirects: "",
        formatversion: 2,
      });

      const res = await fetch(url);
      const body = await res.json();
      const data = body.query.pages[0];
      if (data.missing) return Tritium.reply(msg.from, "Could not find any results.", msg.id);
      /* .setDescription(shorten(data.extract.replaceAll("\n", "\n\n")));*/
      const thumbnail = data.thumbnail ? data.thumbnail.source : "https://i.imgur.com/Z7NJBK2.png";

      const caption =
        `*Wikipedia Query | _${data.title}_*\n` +
        `${data.extract.replace(/\n/g, "\n\n").trim()}\n\n` +
        `🌍 *URL:* https://en.wikipedia.org/wiki/${encodeURIComponent(cleanArgs).replace(/\)/g, "%29")}`;

      await Tritium.sendFileFromUrl(msg.from, thumbnail, "wikipedia.png", caption, msg.id);
    } catch (err) {
      return Tritium.reply(
        msg.from,
        `Oh no, an error occurred: \`${err.message}\`. Try again later!`,
        msg.id,
      );
    }
  },
  {
    triggers: ["wikipedia", "wiki"],
    usage: ["{command} [query]"],
    example: ["{command} Elon Musk"],
    description: "Searches Wikipedia for your query !",

    cooldown: 15,
    minArgs: 1,
    groupOnly: true,
  },
);
