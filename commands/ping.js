exports.name = 'ping'
exports.desc = 'Ping pong to test response time'
exports.needArgs = false;
exports.run = async function (client, message) {
    try {
        await client.sendText(message.from, `Pong 🏓 !!\nSpeed: ${client.utils.processTime(message.t, client.utils.moment())} _s_`, true);
    } catch (error) {
        console.log(error);
    }
}