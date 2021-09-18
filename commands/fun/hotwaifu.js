const TritiumCommand = require("../../models/TritiumCommand");

const fetch = require("node-fetch");

module.exports = new TritiumCommand(
  async ({ Tritium, msg }) => {
    if (msg.isGroupMsg && (await Tritium.db.Settings.getNsfw(msg.GROUP_ID))) {
      const res = await fetch("https://waifu.pics/api/nsfw/waifu");
      const body = await res.json();
      await Tritium.sendFileFromUrl(msg.from, body.url, "waifu.png", "🤤", msg.id);
    } else {
      const waifus = require(Tritium.fromRootPath("assets/waifu.json"));
      const waifu = waifus.getRandom();

      const waifuName = waifu.name.split("from").shift().trim();
      const waifuSource = waifu.name.split("from").pop().trim();

      const caption = `💓 *_${waifuName}_* from *_${waifuSource}_*`;

      await Tritium.sendFileFromUrl(msg.from, waifu.imageUrl, "noicewaifu.jpg", caption, msg.id);
    }
  },
  {
    triggers: ["hotwaifu", "hw"],
    description: "Send a random waifu from a curated list. _(Guaranteed to LOOK NOICCCE 😉)_",

    cooldown: 10,
    groupOnly: true,
  },
);
