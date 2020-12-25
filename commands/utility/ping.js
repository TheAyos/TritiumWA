module.exports = {
    triggers: ["ping", "latency", "speed"],
    usage: "{command}",
    description: "Shows bot ping.",

    isNSFW: false,
    needArgs: false,
    //in secs
    cooldown: 3,

    run: async function (client, message) {
        try {
            await client.sendText(
                message.from,
                `Pong 🏓 !!\n\`\`\`Speed: ${client.utils.processTime(
                    message.t,
                    client.utils.moment(),
                )} s\`\`\``,
                true,
            );
        } catch (error) {
            console.log(error);
        }
    },
};
