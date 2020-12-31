module.exports = {
    triggers: ["anime", "animesearch"],
    usage: "{command} [search]",
    example: "{command} Doctor Stone",
    description: "Send anime info according to search.",

    isNSFW: false,
    needArgs: true,
    cooldown: 10,
    run: async function ({ Tritium, message, args }) {
        const fetch = require("node-fetch");
        const { jikan } = Tritium.utils;
        let query = args.join(" ");

        try {
            Tritium.simulateTyping(message.from, true);
            console.log("[Command request] (anime) " + query);

            let url = `${jikan}search/anime?q=${query}&limit=1`,
                settings = { method: "Get" };

            fetch(url, settings)
                .then((res) => res.json())
                .then(async (body, error) => {
                    if (error) return console.log(error);
                    if (!body.results) {
                        Tritium.simulateTyping(message.from, false);
                        return Tritium.reply(message.from, `*Anime not found 😿!*`, message.id);
                    }
                    let result = body.results[0];
                    if (result.episodes === 0) result.episodes = "Unknown";
                    let caption =
                        "*_Anime found !_*\n\n" +
                        `*✨ Title : ${result.title}*\n\n` +
                        `*_⚜️ Type :_* ${result.type}\n` +
                        `*❤️ Score :* ${result.score} | *🌟 Episodes :* ${result.episodes}\n\n` +
                        `*🌠 Synopsis:* ${result.synopsis}\n\n` +
                        `*🌍 URL :*\n${result.url}`;

                    Tritium.simulateTyping(message.from, false);
                    await Tritium.sendFileFromUrl(
                        message.from,
                        result.image_url,
                        result.image_url.split("/").pop(),
                        caption,
                        message.id,
                    );
                });
        } catch (error) {
            Tritium.simulateTyping(message.from, false);
            console.log(error);
        }
    },
};
