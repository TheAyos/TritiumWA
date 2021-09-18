const TritiumCommand = require("../../models/TritiumCommand");

const fetch = require("node-fetch");

module.exports = new TritiumCommand(
  async ({ Tritium, msg }) => {
    fetch(`http://aws.random.cat/meow`, { method: "Get" })
      .then((res) => res.json())
      .then(async (body, err) => {
        if (err)
          return Tritium.reply(
            msg.from,
            `Oh no, an error occurred: \`${err.message}\`. Try again later!`,
            msg.id,
          );
        await Tritium.sendFileFromUrl(msg.from, body.file, "cat.jpg", "😻", msg.id);
      });
  },
  {
    triggers: ["cat", "kitty", "pussy", "meow", "neko"],
    description: "Send pussy pic pls.",

    cooldown: 10,
    groupOnly: true,
  },
);
