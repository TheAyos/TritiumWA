const TritiumCommand = require("../../models/TritiumCommand");

const fetch = require("node-fetch");

const { URL, URLSearchParams } = require("url");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, args }) {
    try {
      const username = args[0];
      const url = new URL("https://feelinsonice.appspot.com/web/deeplink/snapcode");
      url.search = new URLSearchParams({
        username,
        type: "PNG",
        size: 320,
      });

      const res = await fetch(url);
      const buff = await res.buffer();

      await Tritium.sendImage(
        msg.from,
        `data:image/png;base64,${buff.toString("base64")}`,
        "snapcode.png",
        `👻 *${username}*`,
        msg.id,
      );
    } catch (err) {
      return Tritium.reply(
        msg.from,
        `Shoot, an error occurred: \`${err.message}\`. Try again later!`,
        msg.id,
      );
    }
  },
  {
    triggers: ["snap", "snapcode"],
    usage: ["{command} [username]"],
    example: ["{command} kimkardashian"],
    description: "Sends the Snapcode of a Snapchat user !",

    cooldown: 15,
    minArgs: 1,
    groupOnly: true,
  },
);
