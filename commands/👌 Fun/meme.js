const TritiumCommand = require("@models/TritiumCommand");

module.exports = new TritiumCommand(
  async ({ Tritium, msg, args }) => {
    const fetch = require("node-fetch");

    let query = "";
    if (args.length === 1) query = args.pop();
    else if (args.length > 1) return Tritium.helpThisPoorMan(msg, this);

    let url = "http://meme-api.herokuapp.com/gimme/" + query;
    let settings = { method: "Get" };

    fetch(url, settings)
      .then((res) => res.json())
      .then(async (body, error) => {
        if (error || !body.url) return Tritium.reply(msg.from, "error: " + body.message, msg.id);
        else if (body.nsfw === true && msg.isGroupMsg)
          return Tritium.reply(msg.from, "🔞NSFW available only in dms 😏", msg.id);
        else await Tritium.sendFileFromUrl(msg.from, body.url, body.url.split("/").pop(), body.title);
      });
  },
  {
    triggers: ["meme", "reddit"],
    usage: ["{command}", "{command} <a subreddit to search into>"],
    example: ["{command}", "{command} cursed_comments"],
    description: "Send an ePiC meme from Reddit!",

    cooldown: 10,
  },
);
