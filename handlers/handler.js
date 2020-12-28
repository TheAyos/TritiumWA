module.exports = async function (client, message) {
    //client.getAmountOfLoadedMessages().then((msg) => msg >= 3000 && client.cutMsgCache());

    const prefix = client.prefix; //server prefix after that

    try {
        if (message.body.toLowerCase() === "hi")
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

        const command = message.body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();
        const cleanArgs = body.substring(body.indexOf(" ") + 1); //returns part of the string, from first space to end
        const args = body.trim().split(" ").slice(1); // returns an array of args

        // Grab the command data from client.commands
        const cmd = client.getCommand(command);

        if (!cmd)
            return console.log("[Unregistered command]" + command + " from " + message.sender.id);

        // If command needs args but no args were given
        if (cmd.needArgs && !args.length) return client.helpThisPoorMan(message, cmd);

        // Run the command
        try {
            cmd.run({
                Tritium: client,
                msg: message,
                client,
                message,
                args,
                cleanArgs,
            });
            //cmd.run(client, message, args, cleanArgs);
        } catch (e) {
            client.simulateTyping(message.from, false);
            console.log(error);
        }
    } catch (error) {
        console.error(error);
    }
};
