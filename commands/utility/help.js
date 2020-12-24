module.exports = {
    triggers: ['help', 'commands', 'cmds', 'helpmestepbroimstuck'],
    usage: '{command}\n' +
        '{command} <command>', // category??
    example: '{command} fisheye',
    description: 'Shows a list of commands or command information.',

    isNSFW: false,
    needArgs: false,
    cooldown: 3,
    run: async function (client, message, args) {

        const moment = require('moment');

        try {
            if (!args || args.length == 0) {
                // specify usage of help (for args if > 1)
                let count = 0
                let commandNames = ''
                client.commands.forEach(cmd => {
                    commandNames = commandNames + '```' + cmd.name + '```, ';
                    count++;
                });

                let helpMessageFull = `*Commands*\n\n` +
                    `Use \`\`\`${client.prefix}help <command>\`\`\` to get information about a command.\n` +
                    `*Example:* \`\`\`${client.prefix}help ytmp3\`\`\`\n` +
                    '*Remind:* ```Don\'t use [] or <> in commands.```\n\n' +
                    `*A total of ${count} commands*\n` + commandNames;

                helpMessageFull = helpMessageFull + `\n\n*🤖 Tritium • ${moment().format("HH:mm")}* `;
                client.reply(message.from, helpMessageFull, message.id);
            } else {
                let cmdProps = client.commands.get(args);
                if (!cmdProps) return client.reply(message.from, '*That command doesn\'t exist 😲 !!!*', message.id);

                // /g global flag in regex to replace all matches
                let desc = cmdProps.desc.replace(/.prefix/g, client.prefix); //replace with prefix cuz can't access in modules
                let usage = cmdProps.usage.replace(/.prefix/g, client.prefix); //same
                let example;
                if (cmdProps.example) // cuz example can be optional
                    example = cmdProps.example.replace(/.prefix/g, client.prefix); //same
                let helpMessage = `*Command: ${cmdProps.name}*\n\n` +
                    '*Description:* ' + `${desc}` + '\n' +
                    '*Remind:* Don\'t use [] or <> in commands.\n' +
                    '*Usage*\n' +
                    `\`\`\`${usage}\`\`\``;
                if (example) helpMessage = helpMessage + '\n*Example*\n' +
                    `\`\`\`${example}\`\`\``;

                helpMessage = helpMessage + `\n\n*🤖 Tritium • ${moment().format("HH:mm")}* ` // signature ;)
                client.reply(message.from, helpMessage, message.id);
            }

        } catch (error) {
            console.log(error);
        }
    }
}