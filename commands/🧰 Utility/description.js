module.exports = {
    triggers: ["description", "groupinfo", "grpinfo"],
    usage: "{command} <noting>",
    example: "{command}",
    description: "Send Group's description _(not usable in dm's)_.",

    isNSFW: false,
    needArgs: false,
    cooldown: 3,
    run: async function ({ Tritium, message, args }) {
        if (message.isGroupMsg) {
            Tritium.getChatById(message.chatId).then((value) => {
                const desc = value.groupMetadata;
                Tritium.reply(
                    message.from,
                    "*" + message.chat.name + "*\n🌠️\n✨️ Description:\n " + `${desc}`,
                    message.id,
                    true,
                );
            });
        } else {
            Tritium.reply(message.from, "On n'est pas dans un groupe ! 😤");
            return;
        }
    },
};
