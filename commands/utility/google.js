module.exports = {
    triggers: ['google', 'googlesearch', 'websearch'],
    usage: '{command} <search>',
    example: '{command} how to _pécho_',
    description: 'Searches the web for you, majesty.',

    isNSFW: false,
    needArgs: true,
    cooldown: 3,

    run: async function (client, message, args) {

        try {
            // managed by handler now :(
            /*if (args == '') {
                await client.reply(message.from, 'Ta recherche est vide 😦!', message.id, true);
                return
            }*/
            await client.sendLinkWithAutoPreview(message.from, '*https://www.google.com/search?q=' + args.join('%20') + '*');
        } catch (error) {
            console.log(error);
        }
    }
}