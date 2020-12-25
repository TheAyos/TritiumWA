module.exports = async (msg) => {
    if (msg.sender.isMe) return;
    console.log("[MSGLog] " + msg.sender.pushname + " (" + msg.sender.id + ")", msg.type, msg.body);
};
