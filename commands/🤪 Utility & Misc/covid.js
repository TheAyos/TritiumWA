const TritiumCommand = require("../../models/TritiumCommand");

const fetch = require("node-fetch");

module.exports = new TritiumCommand(
  async ({ Tritium, msg, args, cleanArgs }) => {
    let caption;
    let url;

    if (!args.length) {
      url = `https://disease.sh/v3/covid-19/all`;

      await fetch(url, { method: "Get" })
        .then((res) => res.json())
        .then(async (body) => {
          const { cases, todayCases, deaths, todayDeaths, todayRecovered, active } = body;

          caption =
            `🌍 *World Covid info*\n\n` +
            `🆕 *Today's Cases:* ${todayCases.toLocaleString("en")}\n` +
            `🏵️ *Today's Deaths:* ${todayDeaths.toLocaleString("en")}\n` +
            `🥳 *Today's Recoveries:* ${todayRecovered.toLocaleString("en")}\n\n` +
            `🦠 *Active Cases:* ${active.toLocaleString("en")}\n` +
            `🧫 *Total Cases:* ${cases.toLocaleString("en")}\n` +
            `☣️ *Total Deaths:* ${deaths.toLocaleString("en")}\n`;
        });
    } else {
      url = `https://disease.sh/v3/covid-19/countries/${encodeURIComponent(cleanArgs)}`;

      await fetch(url, { method: "Get" })
        .then((res) => res.json())
        .then(async (body) => {
          const { country, cases, todayCases, deaths, todayDeaths, todayRecovered, active, continent } = body;

          if (!country)
            return Tritium.reply(msg.from, `Couldn't find country. Check your spelling !`, msg.id);

          caption =
            `🌍 Covid info in *${country}, _${continent}_*\n\n` +
            `🆕 *Today's Cases:* ${todayCases.toLocaleString("en")}\n` +
            `🏵️ *Today's Deaths:* ${todayDeaths.toLocaleString("en")}\n` +
            `🥳 *Today's Recoveries:* ${todayRecovered.toLocaleString("en")}\n\n` +
            `🦠 *Active Cases:* ${active.toLocaleString("en")}\n` +
            `🧫 *Total Cases:* ${cases.toLocaleString("en")}\n` +
            `☣️ *Total Deaths:* ${deaths.toLocaleString("en")}\n`;
        });
    }
    Tritium.reply(msg.from, caption, msg.id);
  },
  {
    triggers: ["covid", "corona"],
    description: "Send some covid stats about a country.",
    usage: "{command} [country]",
    example: ["{command} south africa", "{command} USA"],

    cooldown: 10,
    groupOnly: true,
  },
);
