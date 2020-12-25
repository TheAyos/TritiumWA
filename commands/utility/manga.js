module.exports = {
    triggers: ["manga", "mangasearch"],
    usage: "{command} [search]",
    example: "{command} One Piece",
    description: "Send manga info according to search.",

    isNSFW: false,
    needArgs: true,
    cooldown: 10,
    run: async function (client, message, args) {
        const fetch = require("node-fetch");
        const { jikan } = client.utils;
        let query = args.join(" ");

        try {
            client.simulateTyping(message.from, true);
            console.log("[Command request] (manga) " + query);

            let url = jikan + "search/manga?q=" + query + "&limit=1";
            let settings = { method: "Get" };

            fetch(url, settings)
                .then((res) => res.json())
                .then(async (body, error) => {
                    if (error) return console.log(error);
                    let result = body.results[0];
                    if (result == undefined)
                        return client.reply(message.from, `*Manga not found !*`, message.id);
                    if (result.volumes === 0) result.volumes = "Unknown";

                    let caption =
                        "*_Manga found !_*\n\n" +
                        "*✨ Title : " +
                        result.title +
                        "*\n\n" +
                        "*_⚜️ Publishing :_* " +
                        result.publishing +
                        "\n" +
                        "*❤️ Score :* " +
                        result.score +
                        " | " +
                        "*🌟 Volumes :* " +
                        result.volumes +
                        "\n\n" +
                        "*🌠 Synopsis :* " +
                        result.synopsis +
                        "\n\n" +
                        "*🌍 URL:*\n" +
                        result.url;
                    client.simulateTyping(message.from, false);
                    await client.sendFileFromUrl(
                        message.from,
                        result.image_url,
                        result.image_url.split("/").pop(),
                        caption,
                        message.id,
                    );
                });
        } catch (error) {
            client.simulateTyping(message.from, false);
            console.log(error);
        }
    },
};
