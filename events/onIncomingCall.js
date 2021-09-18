module.exports = async (client, call) => {
    await client.sendText(call.peerJid, "I can only talk by chat.");
};