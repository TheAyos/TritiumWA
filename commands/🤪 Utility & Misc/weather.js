const TritiumCommand = require("../../models/TritiumCommand");
const weather = require("weather-js");

// TODO: PASS msg.chatPrefix after settings implementation !! && change L.43

module.exports = new TritiumCommand(
  async ({ Tritium, msg, args, cleanArgs, chatPrefix }) => {
    if (args[0] === "full") {
      cleanArgs = cleanArgs.substr(args[0].length + 1);
    }

    await weather.find({ search: cleanArgs, degreeType: "C" }, async function (err, result) {
      if (err || result === undefined || result.length === 0)
        return Tritium.reply(msg.from, "Unknown city. Please try again.", msg.id);

      const current = result[0].current;
      const location = result[0].location;

      const weatherInfoFull =
        `🌎 *_${current.observationpoint}_*\n` +
        ` ➸ ${current.skytext}\n\n` +
        `🌐 Lat *${location.lat}* | Long *${location.long}*\n` +
        `🌡 Temperature *${current.temperature}° Degrees*\n\n` +
        `🤏 *Feels like ${current.feelslike}°* with\n` +
        `💦 \`\`\`${current.humidity}%\`\`\` *humidity* and\n` +
        `🍃 \`\`\`${current.winddisplay.toLowerCase()}\`\`\` *winds* \n\n` +
        `⏲ _Observed at ${current.observationtime.slice(0, -3)} GMT ${location.timezone}_`;

      const weatherInfoMini =
        `🌎 *_${current.observationpoint}_*\n` +
        ` ➸ \`\`\`${current.skytext}\`\`\`\n` +
        `🤏 *${current.feelslike}°* | ` +
        `💦 *${current.humidity}%* | ` +
        `🍃 *${current.winddisplay.toLowerCase()}*\n` +
        `🧬 _Use ${chatPrefix}weather full ${cleanArgs} for more info._`;

      const weatherInfo = args[0] === "full" ? weatherInfoFull : weatherInfoMini;
      // Tritium.sendFileFromUrl(msg.from, current.imageUrl, "TritiumWeather.gif", weatherInfo, msg.id)
      const fetch = require("node-fetch");
      const buff = await fetch(current.imageUrl).then(async (res) => await res.buffer());
      await Tritium.sendImageAsSticker(msg.from, `data:image/png;base64,${buff.toString("base64")}`);
      Tritium.reply(msg.from, weatherInfo, msg.id);
    });
  },
  {
    triggers: ["weather", "weatherinfo", "wi"],
    usage: ["{command} [city/zipcode]", "{command} full [city/zipcode]"],
    description: "Send weather info for a specific location.",

    minArgs: 1,
    missingArgs: "Please insert the city.", // LOOOK AT THAT BOYOO
    cooldown: 10,
    groupOnly: true,
  },
);
