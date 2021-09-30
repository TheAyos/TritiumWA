const TritiumCommand = require('../../models/TritiumCommand');

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, args, chatPrefix }) {
        const currentNsfw = await Tritium.db.Settings.getNsfw(msg.GROUP_ID);
        if (!args.length) return Tritium.reply(msg.from, `*Currently, NSFW is ${currentNsfw ? 'enabled 😏' : 'disabled 😇'} here.*`, msg.id);

        const isAdmin = msg.chat.groupMetadata.participants.find((c) => c.id === msg.sender.id && c.isAdmin) || msg.sender.id === Tritium.config.youb_id;
        if (!isAdmin) return Tritium.reply(msg.from, 'You need to be administrator to do this.', msg.id);

        let newNsfw;

        if (args[0] === 'enable' || args[0] === 'on') {
            newNsfw = true;
        } else if (args[0] === 'disable' || args[0] === 'off') {
            newNsfw = false;
        } else {
            return await msg.reply(this.getHelpMsg(chatPrefix), true);
        }

        await Tritium.db.Settings.setNsfw(msg.GROUP_ID, newNsfw).catch((e) => console.log(e));

        await Tritium.reply(msg.from, `*NSFW is now ${newNsfw ? 'enabled 😏' : 'disabled 😇'} here.*`, msg.id);
        if (newNsfw === true) {
            const nsfwInfo = 'Some of the NSFW-compatible commands are:\n' + `\`\`\`${chatPrefix}hotwaifu, ${chatPrefix}reddit\`\`\` with nsfw subreddits (e.g. \`\`\`${chatPrefix}reddit nonnude\`\`\`)`;
            await Tritium.reply(msg.from, nsfwInfo, msg.id);
        }
    },
    {
        triggers: ['nsfw', 'setnsfw'],
        description: 'Configure nsfw in this group or get info.',
        usage: '{command} <enable|disable|on|off>',
        example: '{command} enable',

        groupOnly: true,
    },
);
