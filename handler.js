/** TODO
         * 
         * add help manager first like koya style ```
         * if args empty send help in commands
         * and maybe categories
         * add aliases support
         * 
         */

module.exports = handler = async function (client, message) {

    const helpThisPoorMan = client.commands.get('help');
    const prefix = client.prefix;

    try {
        if (message.body === 'Hi')
            client.reply(message.from, `👋 *Hello ${message.sender.pushname} !*`);
        if (!message.body.startsWith(client.prefix)) return;

        let body = message.body

        //understand this?
        body = (message.type === 'chat' && body.startsWith(prefix)) ? body : (((message.type === 'image' || message.type === 'video') && message.caption) && caption.startsWith(prefix)) ? message.caption : ''
        const command = message.body.slice(prefix.length) // slices first charachter (removes prefix)
            .trim() // removes whitespace
            .split(/ +/) // splits on every space (RegEx)
            .shift() // takes the first element and returns it (command in this case)
            .toLowerCase(); // well..
        //returns args separated by a space
        const arg = body.substring(body.indexOf(' ') + 1); //returns part of the string, from first space to end
        const args = body.trim().split(' ').slice(1); // returns an array of args

        const cmd = client.commands.get(command); // Grab the command data from the client.commands Enmap

        if (!cmd) // If that command doesn't exist, silently exit and do nothing
            return console.log('[INFO] Unregistered command ' + command + ' from ' + message.sender.id);

        if (cmd.needArgs && !args.length) // If command needs args but no args were given
            return helpThisPoorMan.run(client, message, [cmd.name]); // as array

        // Run the command
        cmd.run(client, message, args, command);

    } catch (error) {
        console.error(error);
    }
}