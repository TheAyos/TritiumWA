const { readdirSync } = require("fs");

// TODO: throw error if overriding an already registered command (duplicate filenames !!!)
module.exports = function (client) {
  const categories = readdirSync(client.fromRootPath("commands"));
  console.log(`\nFound total ${categories.length} categories.`);

  for (const category of categories) {
    let categoryPath = client.fromRootPath("commands", category);
    let filesInCategory = readdirSync(categoryPath).filter((file) => file.endsWith(".js"));
    console.log(`\n┌ Found total ${filesInCategory.length} command(s) from ${category}`);

    for (const file of filesInCategory) {
      let commandPath = categoryPath + "/" + file;
      console.log(`│ ☄️ Loading command from file ${file}..`);
      try {
        loadCommand(client, commandPath, category);
      } catch (error) {
        console.error(`🔞 Failed to load command from file ${file}: ${error}`);
        throw Error(error);
      }
    }
    console.log(`└ ✨`);
  }
};

function loadCommand(client, commandPath, category) {
  const command = require(commandPath);
  const commandName = command.props.triggers[0];
  command.name = commandName;
  command.category = category;
  client.commands.set(commandName, command);
  command.props.triggers.forEach((alias) => alias != commandName && client.aliases.set(alias, commandName));
}
