module.exports = {
    triggers: ["meme", "reddit"],
    usage: "{command}\n" + "{command} <a subreddit to search into>",
    example: "{command} cursed_comments",
    description: "Send an ePiC meme from Reddit!",

    isNSFW: false,
    needArgs: false,
    cooldown: 10,

    run: async function (client, message, args) {
        const fetch = require("node-fetch");

        let query = "";
        if (args.length === 1) query = args.pop();
        else if (args.length > 1)
            return client.commands.get("help").run(client, message, this.name);

        try {
            client.simulateTyping(message.from, true);

            let url = "http://meme-api.herokuapp.com/gimme/" + query;
            let settings = { method: "Get" };

            fetch(url, settings)
                .then((res) => res.json())
                .then(async (body, error) => {
                    if (error || !body.url)
                        return client.reply(message.from, "error: " + body.message, message.id);
                    else if (body.nsfw == true && message.isGroupMsg)
                        return client.reply(
                            message.from,
                            "🔞NSFW available only in dms 😏",
                            message.id,
                        );
                    else
                        client.simulateTyping(message.from, false) &&
                            (await client.sendFileFromUrl(
                                message.from,
                                body.url,
                                body.url.split("/").pop(),
                                body.title,
                            ));
                });
        } catch (error) {
            client.simulateTyping(message.from, false);
            console.log(error);
        }
    },
};
