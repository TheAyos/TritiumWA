module.exports = {
    triggers: ["waifu", "randomwaifu"],
    usage: "{command}",
    description: "Send a random waifu to contemplate.",

    isNSFW: false,
    needArgs: false,
    cooldown: 10,
    run: async function (client, message) {
        //query after & same for manga?
        //let query = args.join(" ");

        try {
            client.simulateTyping(message.from, true);
            console.log("[Command request] (waifu) ");

            const waifuC = new (require("public-waifulist"))();
            const waifu = await waifuC.getRandom();
            let caption =
                `*_Look at that!_*\n\n` +
                `💫 *Name: ${waifu.data.name}* ➸ from *_${waifu.data.series.name}_*\n` +
                `⚜️ *Description:* ${waifu.data.description}`;

            client.simulateTyping(message.from, false);
            await client.sendFileFromUrl(
                message.from,
                waifu.data.display_picture,
                "waifu.jpg",
                caption,
                message.id,
            );
        } catch (error) {
            client.simulateTyping(message.from, false);
            console.log(error);
        }
    },
};
