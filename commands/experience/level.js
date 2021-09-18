const TritiumCommand = require('../../models/TritiumCommand');

module.exports = new TritiumCommand(
    async function ({ Tritium, msg }) {
        const target = msg.mentionedJidList[0] || msg.sender.id;
        const contact = await Tritium.getContact(target);
        if (contact.isMe) return Tritium.reply(msg.from, '*I would say not far from _♾️infinity♾️_*', msg.id);

        const targetName = contact.formattedName.startsWith('+') ? '@' + contact.id : contact.pushname || contact.formattedName;

        const user = await Tritium.db.Experience.fetch(target, msg.GROUP_ID, true);

        if (!user) return Tritium.reply(msg.from, "Seems like the user didn't earn any xp yet 😑.", msg.id);

        const nextLvlXp = (user.level + 1) ** 2 * 100;
        const xpToLvlUp = nextLvlXp - user.xp;
        const xpcard = `*${targetName}* is\n` + `*Level ${user.level} with 🌟 ${user.xp}/${nextLvlXp} xp*\n` + `Only *🌟 ${xpToLvlUp} more xp* to *level ${user.level + 1} 🌌*`;

        if (contact.formattedName.startsWith('+')) await Tritium.sendTextWithMentions(msg.from, xpcard, msg.id);
        else await Tritium.reply(msg.from, xpcard, msg.id);
    },
    {
        triggers: ['level', 'lvl', 'rank', 'xp'],
        description: 'What level are you 🌟 ?',

        groupOnly: true,
    },
);
