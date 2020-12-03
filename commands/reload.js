exports.run = (client, message, args) => {
    console.log(`[INFO] ${message.sender.id} requested reload`)
    if (message.sender.id !== client.config.youb_id) return
    if (!args || args.length < 1) return client.reply(message.from, "Must provide a command name to reload.", message.id);
    const commandName = args[0];
    // Check if the command exists and is valid
    if (!client.commands.has(commandName)) {
        return client.reply(message.from, "That command does not exist", message.id);
    }
    // the path is relative to the *current folder*, so just ./filename.js
    delete require.cache[require.resolve(`./${commandName}.js`)];
    // We also need to delete and reload the command from the client.commands Enmap
    client.commands.delete(commandName);
    const props = require(`./${commandName}.js`);
    client.commands.set(commandName, props);
    client.reply(message.from, `The command ${commandName} has been reloaded`, message.id);
};