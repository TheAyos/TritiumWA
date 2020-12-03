exports.name = 'google'

exports.desc = 'Send google search.'
exports.usage = `.prefix${this.name} [search]\n`;

exports.needArgs = true;

exports.run = async function (client, message, args) {

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