const TritiumCommand = require("../../models/TritiumCommand");

const fetch = require("node-fetch");

module.exports = new TritiumCommand(
  async ({ Tritium, msg }) => {
    fetch(`https://dog.ceo/api/breeds/image/random`, { method: "Get" })
      .then((res) => res.json())
      .then(async (body, err) => {
        if (err)
          return Tritium.reply(
            msg.from,
            `Oh no, an error occurred: \`${err.message}\`. Try again later!`,
            msg.id,
          );
        await Tritium.sendFileFromUrl(msg.from, body.message, "dog.jpg", "🐶", msg.id);
      });
  },
  {
    triggers: ["dog", "doggo", "waf"],
    description: "Send waf pic pls.",

    cooldown: 10,
    groupOnly: true,
  },
);
