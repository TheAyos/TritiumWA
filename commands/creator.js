exports.name = 'creator';

exports.desc = 'Send this bot\'s creator contact info.';
exports.usage = `.prefix${this.name}`;

exports.needArgs = false;

exports.run = async function (client, message) {

    try {
        await client.sendContact(message.from, client.config.youb_id)
    } catch (error) {
        console.log(error);
    }
}