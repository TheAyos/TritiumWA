const { readdirSync } = require('fs');

module.exports = function (client) {

    const categories = readdirSync("./commands");
    console.log(`\nFound total ${categories.length} categories.`);

    categories.forEach(category => {

        let filesInCategory = readdirSync(`./commands/${category}`);
        console.log(`\nFound total ${filesInCategory.length} command(s) from ./${category}/`);

        for (const file of filesInCategory) {
            if (!file.endsWith(".js")) return;

            console.log(`☄️  Loading command from file ${file}..`);

            try {
                let props = require(`./commands/${category}/${file}`);
                let commandName = props.triggers[0];
                props.category = category;
                client.commands.set(commandName, props);
                props.triggers.forEach(alias => client.aliases.set(alias, commandName))
            } catch (e) {
                console.error(`Failed to register command from file ${file}: ${e}`);
            }

        };
    });
}