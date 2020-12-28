const { readdirSync } = require("fs");

module.exports = function (client) {
    const categories = readdirSync(client.fromRootPath("commands"));
    console.log(`\nFound total ${categories.length} categories.`);

    for (const category of categories) {
        let categoryPath = client.fromRootPath("commands", category);
        let filesInCategory = readdirSync(categoryPath);
        console.log(`\n┌ Found total ${filesInCategory.length} command(s) from ${category}`);

        for (const file of filesInCategory) {
            if (!file.endsWith(".js")) return;
            let commandPath = categoryPath + "/" + file;

            console.log(`│ ☄️ Loading command from file ${file}..`);

            try {
                let props = require(commandPath);
                let commandName = props.triggers[0];
                //props.name = file.split(".").pop();
                props.category = category;
                client.commands.set(commandName, props);
                props.triggers.forEach(
                    (alias) => alias != props.triggers[0] && client.aliases.set(alias, commandName),
                );
            } catch (e) {
                console.error(`🔞 Failed to register command from file ${file}: ${e}`);
            }
        }
        console.log(`└ ✨`);
    }
};
