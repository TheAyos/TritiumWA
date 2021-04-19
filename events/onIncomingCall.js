module.exports = async (client, call) => {
    client.sendText(call.peerJid, "What up ?");
};