const TritiumCommand = require('../../models/TritiumCommand');

const os = require('os');
const sysinfo = require('systeminformation');

module.exports = new TritiumCommand(
    async function ({ Tritium, msg }) {
        const loadedMsgs = await Tritium.getAmountOfLoadedMessages();
        const chatIds = await Tritium.getAllChatIds();
        const groups = await Tritium.getAllGroups();

        const mem = await sysinfo.mem();
        let cleanedCpuName = os.cpus()[0].model.replace(/(\(R\))|(\(TM\))/gi, '');
        cleanedCpuName = cleanedCpuName.replace('CPU', `(${os.cpus().length})`);

        const averageProcessTime = (Tritium.MSG_TIME.map((t) => t.procTime).reduce((acc, val) => acc + val, 0) / Tritium.MSG_TIME.map((t) => t.procTime).length).toFixed(0);

        const caption =
            `Stats :\n\n` +
            `*Last minute average msg procTime: _${averageProcessTime} ms_*\n` +
            `• *${loadedMsgs}* Loaded messages • *${chatIds.length}* Total chats • *${groups.length}* Group chats \n` +
            `\`\`\`CPU : ${Math.floor(Math.random() * 5) + 1 === 0 ? 'A big brain @ 6.9 GHz' : cleanedCpuName}\n` +
            `RAM : ${Math.round(mem.available / 1024 / 1024)} MiB / ${Math.round(mem.total / 1024 / 1024)} MiB\`\`\`\n` +
            // `${process.uptime() % 84600} days, ${process.uptime() % 3600} hours, ${process.uptime() % 60} minutes and ${process.uptime()} seconds` +
            Tritium.getSignature();

        await Tritium.reply(msg.from, caption, msg.id);
    },
    {
        triggers: ['stats', 'botstats'],
        description: 'Send Tritium stats.',
        groupOnly: true,
    },
);
