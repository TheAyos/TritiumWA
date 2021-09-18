const TritiumCommand = require('../../models/TritiumCommand');

module.exports = new TritiumCommand(
    async function ({ Tritium, msg }) {
        const target = msg.mentionedJidList[0] || msg.sender.id;
        const contact = await Tritium.getContact(target);
        if (contact.isMe) return Tritium.reply(msg.from, '*I would say not far from _♾️infinity♾️_*', msg.id);

        const targetName = contact.formattedName.startsWith('+') ? '@' + contact.id : contact.pushname || contact.formattedName;

        const limit = await Tritium.db.Limit.getLimit(target);
        // if (!user) return Tritium.reply(msg.from, "Seems like the user didn't earn any xp yet 😑.", msg.id);

        const caption = `❧ *${targetName}* has *${limit} uses* left 🌟`;

        if (contact.formattedName.startsWith('+')) await Tritium.sendTextWithMentions(msg.from, caption, msg.id);
        else await Tritium.reply(msg.from, caption, msg.id);
    },
    {
        triggers: ['limit', 'quota'],
        description: 'How much command uses have you left 🙃 ?',

        groupOnly: true,
        isNotQuotaLimited: true,
    },
);
