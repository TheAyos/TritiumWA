module.exports = async (client, msg) => {
    if (msg.sender.isMe) return;
    console.log("[MSGLog] " + msg.sender.pushname + " (" + msg.sender.id + ")", msg.type, msg.body);
};
