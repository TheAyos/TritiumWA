module.exports = {
    triggers: ["creator", "author", "owner", "developer"],
    usage: "{command} <noting>",
    example: "{command}",
    description: "Send youbyoub's contact info.",

    isNSFW: false,
    needArgs: false,
    cooldown: 3,
    run: async function ({ Tritium, message }) {
        try {
            await Tritium.sendContact(message.from, Tritium.config.youb_id);
        } catch (error) {
            console.log(error);
        }
    },
};
