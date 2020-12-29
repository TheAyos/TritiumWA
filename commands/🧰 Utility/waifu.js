module.exports = {
    triggers: ["waifu", "randomwaifu"],
    usage: "{command}",
    description: "Send a random waifu to contemplate.",

    isNSFW: false,
    needArgs: false,
    cooldown: 10,

    run: async function ({ Tritium, message }) {
        try {
            Tritium.simulateTyping(message.from, true);
            console.log("[Command request] (waifu) ");

            const waifuC = new (require("public-waifulist"))();
            let waifu = await waifuC.getRandom();

            let i = 0;
            do {
                waifu = await waifuC.getRandom();
                i++;
            } while (i < 3 && !waifu); // if failed, tries to refetch 3 times max

            let caption =
                `*➸ _Look at that!_*\n\n` +
                `💫 *${waifu.data.name}* from *_${waifu.data.series.name}_*\n\n` +
                `🔮 *Description:* ${waifu.data.description}`;

            Tritium.simulateTyping(message.from, false);
            await Tritium.sendFileFromUrl(
                message.from,
                waifu.data.display_picture,
                "waifu.jpg",
                caption,
                message.id,
            );
        } catch (error) {
            Tritium.simulateTyping(message.from, false);
            console.log(error);
        }
    },
};
