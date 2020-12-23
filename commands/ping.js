exports.name = 'ping'

exports.desc = 'Shows bot ping.'
exports.usage = `.prefix${this.name}`;

exports.needArgs = false;

exports.run = async function (client, message) {
    try {
        await client.sendText(message.from, `Pong 🏓 !!\n\`\`\`Speed: ${client.utils.processTime(message.t, client.utils.moment())} s\`\`\``, true);
    } catch (error) {
        console.log(error);
    }
}