module.exports = {
    triggers: ["help", "commands", "cmds", "helpmestepbroimstuck"],
    usage: "{command}\n" + "{command} <command>", // category??
    params: "<command>",
    example: "{command} fisheye",
    description: "Shows a list of commands or command information.",

    isNSFW: false,
    needArgs: false,
    cooldown: 3,
    //categories.general.push(`+ **${command}**${params ? ` ${params}` : ""} - ${description}`)
    run: async function ({ Tritium, message, args }) {
        const moment = require("moment");

        try {
            if (!args.length) {
                let categories = {};
                let cmdCount = 0;
                Tritium.commands.forEach((cmd) => {
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
                    `The prefix of the bot on this server is *${Tritium.prefix}*\n` +
                    `*Example:* \`\`\`${Tritium.prefix}help love\`\`\`\n` +
                    "*Remind:* ```Don't use [ ] or <> in commands.```\n\n" +
                    `*A total of ${cmdCount} commands:*` +
                    `${commandNames}\n\n` +
                    `For more info use \`\`\`${Tritium.prefix}help <command>\`\`\``;

                helpMessageFull =
                    helpMessageFull + `\n\n*🤖 Tritium • ${moment().format("HH:mm")}* `;
                Tritium.reply(message.from, helpMessageFull, message.id);
            } else {
                let cmdProps = Tritium.getCommand(args[0]) || Tritium.getCommand(args);

                if (!cmdProps)
                    return Tritium.reply(
                        message.from,
                        "*That command doesn't exist 😲 !!!*",
                        message.id,
                    );

                cmdName = cmdProps.triggers[0];
                // /g global flag in regex to replace all matches
                let desc = cmdProps.description.replace(/{command}/g, Tritium.prefix + cmdName); //replace with prefix cuz can't access in modules
                let usage = cmdProps.usage.replace(/{command}/g, Tritium.prefix + cmdName); //same
                let example;
                if (cmdProps.example)
                    // cuz example can be optional
                    example = cmdProps.example.replace(/{command}/g, Tritium.prefix + cmdName); //same
                let helpMessage =
                    `*Help | ${cmdName}*\n\n` +
                    "*Description:* " +
                    `${desc}` +
                    "\n" +
                    "*Remind:* Don't use [] or <> in commands.\n" +
                    "*Usage*\n" +
                    `\`\`\`${usage}\`\`\``;
                if (example) helpMessage = helpMessage + "\n*Example*\n" + `\`\`\`${example}\`\`\``;

                helpMessage = helpMessage + `\n\n*🤖 Tritium • ${moment().format("HH:mm")}* `; // signature ;)
                Tritium.reply(message.from, helpMessage, message.id);
            }
        } catch (error) {
            console.log(error);
        }
    },
};
