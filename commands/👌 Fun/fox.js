const TritiumCommand = require("../../models/TritiumCommand");

const fetch = require("node-fetch");
const cheerio = require("cheerio");
module.exports = new TritiumCommand(
  async ({ Tritium, msg }) => {
    const res = await fetch(`https://randomfox.ca/`);
    const $ = cheerio.load(await res.text());
    const imgUrl = $("img#fox_img_link").attr("src");

    await Tritium.sendFileFromUrl(msg.from, imgUrl, "fox.png", "🦊", msg.id);
  },
  {
    triggers: ["fox", "redfox", "foxy"],
    description: "Send foxyy pic pls.",

    cooldown: 10,
    groupOnly: true,
  },
);
