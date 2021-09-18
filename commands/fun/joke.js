const TritiumCommand = require("../../models/TritiumCommand");
const fetch = require("node-fetch");

const TEXT_API_INVALID_RESPONSE = `*The API returned an invalid response 😿. Retry later.*`;

module.exports = new TritiumCommand(
    async function ({ Tritium, msg }) {
        const url = "https://v2.jokeapi.dev/joke/Any?safe-mode";

        const response = await fetch(url, { method: "get" });
        const body = await response.json().catch((error) => console.log(error));
        if (!body) return Tritium.reply(msg.from, TEXT_API_INVALID_RESPONSE, msg.id);

        let caption = `*_A little joke for ya_*\n\n` + `*🧞‍♂️ Type : ${body.type}*\n`;
        if (body.type === "single") caption += `*🌠 Joke :* ${body.joke}\n`;
        else if (body.type === "twopart") caption += `*🌟 Setup :* ${body.setup}\n` + `*🌠 Delivery:* ${body.delivery}\n`;

        // caption += `_Powered by JokeAPI_\n`;
        caption += Tritium.getSignature();

        await Tritium.reply(msg.from, caption, msg.id);
    },
    {
        triggers: ["joke", "jokes", "jk"],
        description: "Sends you a (unbelievably funny) joke.",

        cooldown: 5,
    },
);
