module.exports = async (client, call) => {
    await client.sendText(call.peerJid, "What up ?");
};