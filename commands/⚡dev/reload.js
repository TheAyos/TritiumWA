exports.props = {
  triggers: ["reload", "rl"],
  usage: "{command} <command>",
  example: "{command} help",
  description: "*[DevOnly]* Reloads a specific command.",

  isNSFW: false,
  needArgs: false, //...
  cooldown: 0,
  ownerOnly: true,
};

exports.run = async function ({ Tritium, msg, args }) {
  const { join } = require("path");
  const rootPath = require("path").resolve();
  try {
    console.log(`[INFO] ${msg.sender.id} requested reload`);

    if (msg.sender.id !== Tritium.config.youb_id)
      return Tritium.reply(msg.from, "Only creator can do this.", msg.id);
    if (!args || args.length < 1)
      return Tritium.reply(msg.from, "Must provide a command name to reload.", msg.id);
    const commandName = args[0];
    // Check if the command exists and is valid
    if (!Tritium.commands.has(commandName)) {
      return Tritium.reply(msg.from, "That command does not exist", msg.id);
    }

    // the path is relative to the *current folder*, so just ./filename.js
    delete require.cache[require.resolve(join(rootPath, `${commandName}.js`))];
    // We also need to delete and reload the command from the Tritium.commands Enmap
    Tritium.commands.delete(commandName);
    const props = require(join(rootPath, `${commandName}.js`));
    Tritium.commands.set(commandName, props);
    Tritium.reply(msg.from, `The command ${commandName} has been reloaded`, msg.id);
  } catch (error) {
    console.log(error);
  }
};
