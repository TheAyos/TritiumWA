module.exports = {
    triggers: ["help", "commands", "cmds", "helpmestepbroimstuck"],
    usage: "{command}\n" + "{command} <command>", // category??
    example: "{command} fisheye",
    description: "Shows a list of commands or command information.",

    isNSFW: false,
    needArgs: false,
    cooldown: 3,

    run: async function (client, message, args) {
        const moment = require("moment");

        try {
            if (!args.length) {
                let categories = {};
                let cmdCount = 0;
                client.commands.forEach((cmd) => {
                    cmdCount++;
                    let category = categories[cmd.category];
                    if (!category) {
                        category = categories[cmd.category] = [];
                    }
                    category.push(cmd.triggers[0]);
                });

                let commandNames = "";
                commandNames = Object.keys(categories).map(
                    (category) => `\n*${category}*\n\`\`\`${categories[category].join(", ")}\`\`\``,
                );

                let helpMessageFull =
                    `*Bot Commands*\n\n` +
                    `The prefix of the bot on this server is *${client.prefix}*\n` +
                    `*Example:* \`\`\`${client.prefix}help love\`\`\`\n` +
                    "*Remind:* ```Don't use [] or <> in commands.```\n\n" +
                    `*A total of ${cmdCount} commands:*` +
                    `${commandNames}\n\n` +
                    `For more info use \`\`\`${client.prefix}help <command>\`\`\``;

                helpMessageFull =
                    helpMessageFull + `\n\n*🤖 Tritium • ${moment().format("HH:mm")}* `;
                client.reply(message.from, helpMessageFull, message.id);
            } else {
                let cmdProps =
                    client.commands.get(args[0]) ||
                    client.commands.get(client.aliases.get(args[0]));
                //if requested for more than one command
                if (args.length > 1) {
                    cmdProps = client.commands.get("help");
                }
                if (!cmdProps)
                    return client.reply(
                        message.from,
                        "*That command doesn't exist 😲 !!!*",
                        message.id,
                    );

                cmdName = cmdProps.triggers[0];
                // /g global flag in regex to replace all matches
                let desc = cmdProps.description.replace(/{command}/g, client.prefix + cmdName); //replace with prefix cuz can't access in modules
                let usage = cmdProps.usage.replace(/{command}/g, client.prefix + cmdName); //same
                let example;
                if (cmdProps.example)
                    // cuz example can be optional
                    example = cmdProps.example.replace(/{command}/g, client.prefix + cmdName); //same
                let helpMessage =
                    `*Command: ${cmdName}*\n\n` +
                    "*Description:* " +
                    `${desc}` +
                    "\n" +
                    "*Remind:* Don't use [] or <> in commands.\n" +
                    "*Usage*\n" +
                    `\`\`\`${usage}\`\`\``;
                if (example) helpMessage = helpMessage + "\n*Example*\n" + `\`\`\`${example}\`\`\``;

                helpMessage = helpMessage + `\n\n*🤖 Tritium • ${moment().format("HH:mm")}* `; // signature ;)
                client.reply(message.from, helpMessage, message.id);
            }
        } catch (error) {
            console.log(error);
        }
    },
};
