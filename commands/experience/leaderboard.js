const TritiumCommand = require('../../models/TritiumCommand');

module.exports = new TritiumCommand(
    async function ({ Tritium, msg }) {
        const target = msg.mentionedJidList[0] || msg.sender.id;

        const contact = await Tritium.getContact(target);
        if (contact.isMe) return Tritium.reply(msg.from, '*For _obvious fair-play reasons_, i do not include myself in the leaderboard*', msg.id);
        const targetName = contact.formattedName.startsWith('+') ? '@' + contact.id.split('@').shift() : contact.pushname || contact.formattedName;

        const leaderboard = await Tritium.db.Experience.fetchLeaderboard(msg.GROUP_ID);

        if (leaderboard.length < 1) return Tritium.reply(msg.from, "Nobody's in leaderboard yet.", msg.id);

        const position = leaderboard.findIndex((i) => i.groupID === msg.GROUP_ID && i.userID === target) + 1;
        const user = leaderboard[position - 1];

        if (!user) return Tritium.reply(msg.from, "Seems like the user didn't earn any xp yet 😑.", msg.id);

        const lbcard = `*${targetName}* is\n` + `🥇 *${position.toOrdinal()}* in *${msg.chat.name}*\n` + `✨ *Level: ${user.level}*\n` + `🌌 *XP: ${user.xp}*`;
        if (contact.formattedName.startsWith('+')) await Tritium.sendTextWithMentions(msg.from, lbcard, msg.id);
        else await Tritium.reply(msg.from, lbcard, msg.id);
    },
    {
        triggers: ['leaderboard', 'lb', 'topxp'],
        description: 'Where are you on the leaderboard ?',

        groupOnly: true,
    },
);
