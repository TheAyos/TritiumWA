const TritiumCommand = require("../../models/TritiumCommand");
const Settings = require("../../utils/Settings");

const fetch = require("node-fetch");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, args }) {
    let query = "";
    if (args.length === 1) query = args.pop();
    else if (args.length > 1) return Tritium.helpThisPoorMan(msg, this);

    let url = "http://meme-api.herokuapp.com/gimme/" + query;
    let settings = { method: "Get" };

    fetch(url, settings)
      .then((res) => res.json())
      .then(async (body, error) => {
        if (error || !body.url) return Tritium.reply(msg.from, "error: " + body.message, msg.id);
        if (body.nsfw === true && msg.isGroupMsg && !(await Settings.getNsfw(msg.groupId))) {
          return Tritium.reply(msg.from, "*🔞 NSFW is not allowed in this group 😏*", msg.id);
        } else await Tritium.sendFileFromUrl(msg.from, body.url, body.url.split("/").pop(), body.title);
      });
  },
  {
    triggers: ["meme", "reddit", "subreddit", "sr"],
    usage: ["{command}", "{command} <a subreddit to search into>"],
    example: ["{command}", "{command} cursed_comments"],
    description: "Send an ePiC meme from Reddit!",

    cooldown: 10,
    groupOnly: true,
  },
);
