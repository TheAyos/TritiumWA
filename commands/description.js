exports.name = 'creator';

exports.desc = 'Send this bot\'s creator contact info.';
exports.usage = `.prefix${this.name}`;

exports.needArgs = false;

exports.run = async function (client, message, args) {
    if (message.isGroupMsg) {
        client.getChatById(message.chatId).then(value => {
            const desc = value.groupMetadata;
            client.reply(message.from, '*' + message.chat.name + '*\n🌠️\n✨️ Description:\n ' + `${desc}`, message.id, true)
        });
    } else {
        client.reply(message.from, "On n'est pas dans un groupe ! 😤");
        return;
    }
}
