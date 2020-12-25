module.exports = {
    triggers: ["reload", "rl"],
    usage: "{command} <command>",
    example: "{command} help",
    description: "*[DevOnly]* Reloads a specific command.",

    isNSFW: false,
    needArgs: false, //...
    cooldown: 0,

    run: function (client, message, args) {
        try {
            console.log(`[INFO] ${message.sender.id} requested reload`);

            if (message.sender.id !== client.config.youb_id)
                return client.reply(message.from, "Only creator can do this.", message.id);
            if (!args || args.length < 1)
                return client.reply(
                    message.from,
                    "Must provide a command name to reload.",
                    message.id,
                );
            const commandName = args[0];
            // Check if the command exists and is valid
            if (!client.commands.has(commandName)) {
                return client.reply(message.from, "That command does not exist", message.id);
            }

            client.simulateTyping(message.from, true);
            // the path is relative to the *current folder*, so just ./filename.js
            delete require.cache[require.resolve(`./${commandName}.js`)];
            // We also need to delete and reload the command from the client.commands Enmap
            client.commands.delete(commandName);
            const props = require(`./${commandName}.js`);
            client.commands.set(commandName, props);
            client.simulateTyping(message.from, false);
            client.reply(message.from, `The command ${commandName} has been reloaded`, message.id);
        } catch (error) {
            client.simulateTyping(message.from, false);
            console.log(error);
        }
    },
};
