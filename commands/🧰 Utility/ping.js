module.exports = {
    triggers: ["ping", "latency", "speed"],
    usage: "{command}",
    description: "Shows bot ping.",

    isNSFW: false,
    needArgs: false,
    cooldown: 3,

    run: async function ({ Tritium, message }) {
        try {
            await Tritium.sendText(
                message.from,
                `Pong 🏓 !!\n\`\`\`Speed: ${Tritium.utils.processTime(
                    message.t,
                    Tritium.utils.moment(),
                )} s\`\`\``,
                true,
            );
        } catch (error) {
            console.log(error);
        }
    },
};
