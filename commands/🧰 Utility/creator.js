module.exports = {
    triggers: ["creator", "author", "owner", "developer"],
    usage: "{command} <noting>",
    example: "{command}",
    description: "Send youbyoub's contact info.",

    isNSFW: false,
    needArgs: false,
    cooldown: 3,
    run: async function ({ client, message }) {
        try {
            await client.sendContact(message.from, client.config.youb_id);
        } catch (error) {
            console.log(error);
        }
    },
};
