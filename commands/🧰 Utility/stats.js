module.exports = {
    triggers: ["stats", "botstats"],
    usage: "{command}",
    description: "Send Tritium stats.",

    isNSFW: false,
    needArgs: false,
    cooldown: 3,

    run: async function ({ client, message }) {
        try {
            client.simulateTyping(message.from, true);
            console.log("[Command request] (waifu) ");

            const loadedMsgs = await client.getAmountOfLoadedMessages();
            const chatIds = await client.getAllChatIds();
            const groups = await client.getAllGroups();
            client.sendText(
                message.from,
                `Status :\n- *${loadedMsgs}* Loaded messages\n- *${groups.length}* Group chats\n- *${chatIds.length}* Total chats`,
            );
        } catch (error) {
            client.simulateTyping(message.from, false);
            console.log(error);
        }
    },
};
