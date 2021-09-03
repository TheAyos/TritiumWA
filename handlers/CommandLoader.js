const { readdirSync } = require("fs");

// TODO: throw error if overriding an already registered command (duplicate filenames !!!)
module.exports = function (client) {
  const categories = readdirSync(client.fromRootPath("commands"));
  console.log(`\nFound total ${categories.length} categories.`);

  for (const category of categories) {
    const categoryPath = client.fromRootPath("commands", category);
    const filesInCategory = readdirSync(categoryPath).filter((file) => file.endsWith(".js"));
    console.log(`\n┌ Found total ${filesInCategory.length} command(s) from ${category}`);

    for (const file of filesInCategory) {
      const commandPath = categoryPath + "/" + file;
      console.log(`│ ☄️ Loading command from file ${file}..`);
      try {
        loadCommand(client, commandPath, category);
      } catch (error) {
        console.error(`🔞 Failed to load command from file ${file}: ${error}`);
        throw Error(`🔞 Failed to load command from file ${file}: ${error}`);
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
  const existingCommandCheck = client.commands.find((c) => c.props && c.props.triggers.includes(commandName));
  if (existingCommandCheck)
    throw new Error(
      `Command loader > Command ${commandName} is already registered !\n` +
        `Old command: \n${JSON.stringify(existingCommandCheck)}\n\n` +
        `New command: \n${JSON.stringify(command)}\n\n`,
    );
  client.commands.push(command);
}
