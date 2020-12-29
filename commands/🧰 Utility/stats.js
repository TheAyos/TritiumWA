module.exports = {
    triggers: ["stats", "botstats"],
    usage: "{command}",
    description: "Send Tritium stats.",

    isNSFW: false,
    needArgs: false,
    cooldown: 3,

    run: async function ({ Tritium, message }) {
        try {
            Tritium.simulateTyping(message.from, true);
            console.log("[Command request] (waifu) ");

            const loadedMsgs = await Tritium.getAmountOfLoadedMessages();
            const chatIds = await Tritium.getAllChatIds();
            const groups = await Tritium.getAllGroups();
            Tritium.sendText(
                message.from,
                `Status :\n- *${loadedMsgs}* Loaded messages\n- *${groups.length}* Group chats\n- *${chatIds.length}* Total chats`,
            );
        } catch (error) {
            Tritium.simulateTyping(message.from, false);
            console.log(error);
        }
    },
};
