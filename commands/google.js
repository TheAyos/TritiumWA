exports.run = async (client, message, args) => {
    try {
        if (args == '') {
            await client.reply(message.from, 'Ta recherche est vide 😦!', message.id, true);
            return
        }
        await client.sendLinkWithAutoPreview(message.from, '*https://www.google.com/search?q=' + args.join('%20') + '*');
    } catch (error) {
        console.log(error);
    }
}