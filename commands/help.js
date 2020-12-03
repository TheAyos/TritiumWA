exports.name = 'help'
exports.desc = 'Shows curated list of help'
exports.needArgs = false; // maybe add optional ??
exports.run = async function (client, message, args) {

    try {
        if (!args || args.length == 0) {
            // specify usage of help (for args if > 1)
            client.reply(message.from, 'ya help is getting there', message.id);
        } else {
            let desc = client.commands.get(args).desc;
            // /g global flag in regex to replace all matches
            desc = desc.replace(/.prefix/g, client.prefix); //replace with prefix cuz can't access in modules
            desc = desc + `\n\n*🤖 Tritium • ${moment().format("HH:mm")}*` // signature ;)
            if (desc)
                client.reply(message.from, cmdDesc, message.id);
        }

    } catch (error) {
        console.log(error);
    }
}