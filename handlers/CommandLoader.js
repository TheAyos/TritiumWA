const { readdirSync } = require('fs');
const { join } = require('path');

module.exports = function (client) {
    const categories = readdirSync(join(__dirname, '../', 'commands'));
    console.log(`\nFound total ${categories.length} categories.`);

    for (let categoryPath of categories) {
        categoryPath = join(__dirname, '../', 'commands', categoryPath);
        let category;
        try {
            category = require(categoryPath);
            console.log(`\n┌ Found total ${category.commands.length} command(s) from ${category.name} at ${categoryPath}`);
            for (const command of category.commands) {
                command.name = command.props.triggers[0];
                command.category = category.name;

                console.log(`│ ☄️ Loading command ${command.name} from category ${command.category}..`);

                const existingCommandCheck = client.commands.find((c) => c.props && c.props.triggers.includes(command.name));
                if (existingCommandCheck)
                    throw new Error(
                        `Command loader > Command ${command.name} is already registered !\n` +
                            `Old command: \n${JSON.stringify(existingCommandCheck)}\n\n` +
                            `New command: \n${JSON.stringify(command)}\n\n`,
                    );
                client.commands.push(command);
            }
        } catch (error) {
            console.error(`🔞 Failed to load command from file ${categoryPath}: ${error}`);
            // throw Error(`🔞 Failed to load command from file ${categoryPath}: ${error}`);
        }
    }
    console.log('└ ✨');
};
