const TritiumCommand = require("@models/TritiumCommand");
const weather = require("weather-js");

//TODO: PASS msg.chatPrefix after settings implementation !! && change L.43

module.exports = new TritiumCommand(
  async ({ Tritium, msg, args, cleanArgs }) => {
    if (args[0] === "full") {
      cleanArgs = cleanArgs.substr(args[0].length + 1);
    }

    await weather.find({ search: cleanArgs, degreeType: "C" }, function (err, result) {
      if (err || result === undefined || result.length === 0)
        return Tritium.reply(msg.from, "Unknown city. Please try again.", msg.id);

      let current = result[0].current;
      let location = result[0].location;

      let weatherInfoFull =
        `🌎 *_${current.observationpoint}_*\n` +
        ` ➸ ${current.skytext}\n\n` +
        `🌐 Lat *${location.lat}* | Long *${location.long}*\n` +
        `🌡 Temperature *${current.temperature}° Degrees*\n\n` +
        `🤏 *Feels like ${current.feelslike}°* with\n` +
        `💦 \`\`\`${current.humidity}%\`\`\` *humidity* and\n` +
        `🍃 \`\`\`${current.winddisplay.toLowerCase()}\`\`\` *winds* \n\n` +
        `⏲ _Observed at ${current.observationtime.slice(0, -3)} GMT ${location.timezone}_`;

      let weatherInfoMini =
        `🌎 *_${current.observationpoint}_*\n` +
        ` ➸ \`\`\`${current.skytext}\`\`\`\n` +
        `🤏 *${current.feelslike}°* | ` +
        `💦 *${current.humidity}%* | ` +
        `🍃 *${current.winddisplay.toLowerCase()}*\n` +
        `🧬 _Use ${Tritium.prefix}weather full ${cleanArgs} for more info._`;

      let weatherInfo = args[0] === "full" ? weatherInfoFull : weatherInfoMini;
      Tritium.sendFileFromUrl(msg.from, current.imageUrl, "TritiumWeather.gif", weatherInfo, msg.id);
    });
  },
  {
    triggers: ["weather", "weatherinfo", "wi"],
    usage: ["{command} [city/zipcode]", "{command} full [city/zipcode]"],
    description: "Send weather info for a specific location.",

    minArgs: 1,
    missingArgs: "Please insert the city.", // LOOOK AT THAT BOYOO
    cooldown: 10,
  },
);
