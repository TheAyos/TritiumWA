module.exports = async function (client, message) {
    const helpThisPoorMan = client.commands.get("help");
    const prefix = client.prefix;

    try {
        if (message.body === "Hi")
            client.reply(message.from, `👋 *Hello ${message.sender.pushname} !*`);

        if (!message.body.startsWith(prefix)) return;

        let body = message.body;

        //understand this?
        body =
            message.type === "chat" && body.startsWith(prefix)
                ? body
                : (message.type === "image" || message.type === "video") &&
                  message.caption &&
                  caption.startsWith(prefix)
                ? message.caption
                : "";
        const command = message.body
            .slice(prefix.length) // slices first charachter (removes prefix)
            .trim() // removes whitespace
            .split(/ +/) // splits on every space (RegEx)
            .shift() // takes the first element and returns it (command in this case)
            .toLowerCase(); // well..
        //returns args separated by a space
        const arg = body.substring(body.indexOf(" ") + 1); //returns part of the string, from first space to end
        const args = body.trim().split(" ").slice(1); // returns an array of args

        const cmd =
            client.commands.get(command) || client.commands.get(client.aliases.get(command)); // Grab the command data from client.commands

        if (!cmd)
            return console.log(
                "[INFO] Unregistered command " + command + " from " + message.sender.id,
            );

        if (cmd.needArgs && !args.length)
            // If command needs args but no args were given
            return helpThisPoorMan.run(client, message, cmd);

        // Run the command
        cmd.run(client, message, args);
    } catch (error) {
        console.error(error);
    }
};
