const TritiumCommand = require("../../models/TritiumCommand");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg }) {
    const waifuC = new (require("public-waifulist"))();
    let waifu = await waifuC.getRandom();

    let i = 0;
    do {
      waifu = await waifuC.getRandom();
      i++;
    } while (i < 3 && !waifu); // if failed, tries to refetch 3 times max

    const caption =
      `*➸ _Look at that!_*\n\n` +
      `💫 *${waifu.data.name}* from *_${waifu.data.series.name}_*\n\n` +
      `🔮 *Description:* ${waifu.data.description}`;

    await Tritium.sendFileFromUrl(msg.from, waifu.data.display_picture, "waifu.png", caption, msg.id);
  },
  {
    triggers: ["waifu", "randomwaifu", "rw"],
    description: "Send a random waifu to contemplate.",

    cooldown: 10,
    groupOnly: true,
  },
);
