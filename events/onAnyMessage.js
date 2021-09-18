const { cColor: cc } = require('../utils/misc');

const { default: PQueue } = require('p-queue');
const queue = new PQueue({ concurrency: 7, autoStart: true });

// Checks before command execution should now be handled in command class :)

// ME
const VIP_PEOPLE = ['212641715835'];
// man on anime group, ANAS, SALMA //TODO: replace that with levels and goodies
const PEOPLE_PLUS = ['18765495289', '212671421331', '212648539080'];

module.exports = async (Tritium, msg) => {
    if (!msg.sender || msg.sender.isMe || (!msg.body && !msg.caption)) return;
    Tritium.log(`${msg.sender.pushname} | ${msg.chat.name} -> ${msg.type === 'chat' ? msg.body : '(data64 or other)'}`, `${msg.sender.IS_VIP ? '(VIP) ' : '(plebs)'}`);

    // if (!VIP_PEOPLE.includes(msg.sender.PHONE_NUMBER)) return; // Testing mode

    const start = Date.now();
    const xpCooldown = Tritium.config.experienceCooldownMs;

    // *** Helper functions ***
    msg.reply = function (content) { Tritium.reply(this.from, content, this.id); }; /* prettier-ignore */
    msg.GROUP_ID = msg.isGroupMsg ? msg.chat.groupMetadata.id : undefined;

    msg.sender.PHONE_NUMBER = msg.sender.id.split('@').shift();
    msg.sender.IS_VIP = VIP_PEOPLE.includes(msg.sender.id.split('@').shift());

    msg._quotedMsg = msg.quotedMsg || msg.quotedMsgObj;
    msg._hasQuotedImage = msg.type === 'image' || (msg.quotedMsg && msg._quotedMsg.type === 'image') ? true : false;
    msg._hasQuotedVideo = msg.type === 'video' || (msg.quotedMsg && msg._quotedMsg.type === 'video') ? true : false;
    msg._hasQuotedPtt = msg.type === 'ptt' || (msg.quotedMsg && msg._quotedMsg.type === 'ptt') ? true : false;
    msg._encryptedMedia = msg.isMedia ? msg : msg._quotedMsg && msg._quotedMsg.isMedia ? msg._quotedMsg : undefined;
    msg._mediaMimetype = msg.isMedia ? msg.mimetype : msg.quotedMsg && msg.quotedMsg.isMedia ? msg.quotedMsg.mimetype : undefined;

    try {
        cleanMsgCacheIfNeeded(Tritium);

        randomVeryFunnyResponses(Tritium, msg);

        // *** Prefix ***
        const prefix = msg.isGroupMsg ? await Tritium.db.Settings.getPrefix(msg.GROUP_ID) : Tritium.config.prefix;

        // TODO: custom level up message per-group
        // *** Experience ***
        if (msg.isGroupMsg) {
            const randXp = Math.floor(Math.random() * 11) + 1;
            const hasLeveledUp = await Tritium.db.Experience.appendXp(msg.sender.id, msg.GROUP_ID, randXp, xpCooldown);
            if (hasLeveledUp) {
                const user = await Tritium.db.Experience.fetch(msg.sender.id, msg.GROUP_ID);
                await Tritium.sendTextWithMentions(
                    msg.from,
                    `@${msg.sender.PHONE_NUMBER}, congratulations ! 🎉\n` + `You have leveled up to *level ${user.level}* 🥳\n` + `_🧬 use the ${prefix}xp command for more info._`,
                );
            }
        }

        // *** Body parsing ***
        let body = msg.body;
        if (msg.type === 'chat' && body.startsWith(prefix)) {
            console.log('msg if of type chat and starts with prefix');
            body = msg.body;
        } else if (msg.type === 'image' || msg.type === 'video') {
            console.log('msg is of type img or video');
            if (msg.caption && msg.caption.startsWith(prefix)) {
                console.log('and it has a caption that starts with the prefix');
                body = msg.caption;
            }
        } else return;

        const args = body.slice(prefix.length).trim().split(/[ ]+/g);
        const cmdName = args.shift().toLowerCase();
        const cleanArgs = args.join(' ');
/*
        if (cmdName === 'lovedev') {
            if (cleanArgs.includes('+')) cleanArgs.replace('+', ''), args.length--;
            else if (cleanArgs.includes('|')) cleanArgs.replace('|', ''), args.length--;
            if (args.length > 2) return Tritium.reply(msg.from, 'Calm down ! Two people is already enough !', msg.id);

            if (msg.mentionedJidList.length === 2) {
                const target = msg.mentionedJidList[0] || msg.sender.id;
                const contact = await Tritium.getContact(target);

                let targetName = contact.formattedName.startsWith('+') ? '@' + contact.id : contact.pushname || contact.formattedName;
                if (contact.isMe) targetName = contact.id;

                if (targetName.startsWith('@')) Tritium.sendTextWithMentions(msg.from, targetName, msg.id);
                else Tritium.reply(msg.from, target, msg.id);

                const target2 = msg.mentionedJidList[1] || msg.sender.id;
                const contact2 = await Tritium.getContact(target2);

                let targetName2 = contact2.formattedName.startsWith('+') ? '@' + contact2.id : contact2.pushname || contact2.formattedName;
                if (contact.isMe) targetName2 = '@' + contact.id;

                if (targetName2.startsWith('@')) Tritium.sendTextWithMentions(msg.from, targetName2, msg.id);
                else Tritium.reply(msg.from, targetName2, msg.id);

                return console.log(targetName, targetName2, 'here');
            } else {
                let fname = '';
                let sname = '';

                const ff = await Tritium.getContact(msg.mentionedJidList[0]);
                console.log(ff);

                console.log(msg.mentionedJidList);
                console.log(msg.mentionedJidList.length);

                console.log(fname);
                console.log(sname);
                if (msg.mentionedJidList.length === 1 && args.length === 2) {
                    const ff = await Tritium.getContact(msg.mentionedJidList[0]);
                    fname = ff.pushname || ff.formattedName;
                    sname = ff.pushname || ff.formattedName;
                } else if (msg.mentionedJidList.length === 2) {
                    const ff = await Tritium.getContact(msg.mentionedJidList[0]);
                    const ss = await Tritium.getContact(msg.mentionedJidList[1]);
                    fname = ff.pushname || ff.formattedName;
                    sname = ss.pushname || ss.formattedName;
                } else {
                    fname = args[0];
                    sname = args[1];
                }
                console.log(fname);
                console.log(sname);
                console.log('calculate love then');
                return;
            }
        }
*/
        const command = Tritium.commands.find((c) => c.props.triggers.includes(cmdName));
        if (!command) return Tritium.log(`=> Unregistered ${msg.type === 'chat' ? cmdName : 'data64'} from ${msg.sender.id}`);

        Tritium.stats.commands.ran++;
        Tritium.log(`ran command ${cmdName}`, `${msg.sender.pushname} (${msg.sender.id})`);
        Tritium.log(`${Tritium.stats.commands.ran} ran commands since startup`);

        // *** Quotas *** //
        if (!command.props.isNotQuotaLimited) {
            const result = await updateQuotas(Tritium, msg, command);
            if (result) {
                console.log(cc(`${msg.sender.pushname} exceeded his daily quota, cmd not executed`, 'red'));
                return msg.reply(`You exceeded your daily quota (${Tritium.config.dailyQuota} command uses)`);
            }
        }

        queue.add(async () => await command.run({ Tritium, msg, args, cleanArgs, chatPrefix: prefix, usedAlias: cmdName, updateCooldowns }).catch((e) => e), { priority: 666 });
    } catch (error) {
        Tritium.error(error);
    }

    // *** Cooldowns ***
    async function updateCooldowns(command) {
        if (VIP_PEOPLE.includes(msg.sender.PHONE_NUMBER)) return false;
        if (!Tritium.cooldowns.has(command.name)) Tritium.cooldowns.set(command.name, new Map());
        const now = Date.now();
        const timestamps = Tritium.cooldowns.get(command.name);

        let commandCooldown = command.props.cooldown * 1000;
        if (PEOPLE_PLUS.includes(msg.sender.PHONE_NUMBER)) commandCooldown = commandCooldown / 2;

        if (timestamps.has(msg.sender.id)) {
            const expirationTime = timestamps.get(msg.sender.id) + commandCooldown;
            if (now < expirationTime) {
                const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
                const msgId = await Tritium.sendText(msg.from, `You need to wait ${timeLeft}s before reusing \`${command.name}\` 😃`, true);
                setTimeout(
                    () =>
                        queue.add(async () => await Tritium.deleteMessage(msg.chat.contact.id, msgId), console.log(`${msg.sender.id}'s cooldown for command ${command.name} expired !`, timestamps), {
                            priority: 0,
                        }),
                    commandCooldown,
                );
                return true;
            }
        } else {
            timestamps.set(msg.sender.id, now);
            console.log(`${msg.sender.id} now has a cooldown for command ${command.name} of ${commandCooldown} seconds !`, timestamps);
            setTimeout(() => {
                timestamps.delete(msg.sender.id);
                console.log(`${msg.sender.id}'s cooldown for command ${command.name} expired !`, timestamps);
            }, commandCooldown);
            return false;
        }
    }

    // *** Stats ***
    Tritium.MSG_TIME.push({ time: Date.now(), procTime: Date.now() - start });
    Tritium.MSG_TIME = Tritium.MSG_TIME.filter((t) => t.time > Date.now() - 60 * 1000); // keep process times for 1 minute
    const averageProcessTime = Math.round(Tritium.MSG_TIME.map((t) => t.procTime).reduce((acc, val) => (acc + val) / 2, 0));

    Tritium.log(`1 min procTime avg: ${averageProcessTime} ms`);
    Tritium.log(`Queue size: ${queue.size} | pending: ${queue.pending} | concurrency: ${queue.concurrency}`);
};

async function cleanMsgCacheIfNeeded(Tritium) {
    const loadedMessagesCache = await Tritium.getAmountOfLoadedMessages();
    if (loadedMessagesCache >= 666) {
        await Tritium.cutMsgCache();
        const afterCutInfo = await Tritium.cutChatCache();
        const caption =
            `Msgs cache reached ${loadedMessagesCache} messages. Cleaning...\n` +
            `Went from ${afterCutInfo.before.chats} chats and ${afterCutInfo.before.msgs} msgs.\n` +
            `To ${afterCutInfo.after.chats} chats and ${afterCutInfo.after.msgs} msgs.\n${Tritium.getSignature()}`;
        Tritium.sendText(Tritium.config.youb_id, caption);
    }
}

async function randomVeryFunnyResponses(Tritium, msg) {
    const bL = msg.body.toLowerCase();
    if (bL === 'hi' || bL === 'hey' || bL === 'hello') {
        await msg.reply(`👋 *Hello ${msg.sender.pushname} !*`);
        if (!msg.isGroupMsg) return Tritium.reply(msg.from, Tritium.getFullHelpMsg(Tritium.config.prefix), msg.id);
        else return Tritium.reply(msg.from, `You should maybe use .help ;) ? Recommended commands of the day: .covid, .play, .yt, .wikipedia, .tts`, msg.id); // TODO: add msg.CHAT_PREFIX
    }

    if (bL === 'gn' || (bL.includes('good') && bL.includes('night')) || bL === 'nik') return msg.reply(`_*🌃 good night ${msg.sender.pushname} !*_`);
    if (bL.includes('jordi nino') || bL.includes('nino pola')) return msg.reply(`_*Father ?*_`);
    if ((bL.includes('mia') && bL.includes('khalifa')) || bL.includes('khalifa')) return msg.reply(`_*Mamma ?*_`);
    if (bL.includes('fuck me')) return msg.reply(`_*Let's do that !*_`);
    if (bL.includes('fuck me pls')) return msg.reply(`_*Let's do that ! Now.*_`);
    if (bL.includes('wanna go out ?')) return msg.reply(`_*i'm up*_`);
    if (bL.includes('i need a gf')) return msg.reply(`_*pick ya up at 8 ?*_`);
    if (bL.includes('i love you')) return msg.reply(`_*meee two*_`);
    if (bL.includes('i love feet')) return msg.reply(`_*wait what ?*_`);
}

async function updateQuotas(Tritium, msg) {
    let dailyQuota = Tritium.config.dailyQuota;

    if (VIP_PEOPLE.includes(msg.sender.PHONE_NUMBER)) return false;
    else if (PEOPLE_PLUS.includes(msg.sender.PHONE_NUMBER)) dailyQuota = dailyQuota * 2;

    const lastUpdated = await Tritium.db.Limit.getLastUpdated(msg.sender.id);
    let limit = await Tritium.db.Limit.getLimit(msg.sender.id);

    const midnight = new Date(new Date().setHours(24, 0, 0, 0));

    console.log(midnight.getTime(), 'midnight');
    console.log(lastUpdated, 'lastupdated');
    console.log('should reset quota ?', midnight - lastUpdated > 86400000);

    // A day in ms : 86400000 (60*60*24*1000)
    if (midnight - lastUpdated > 86400000) {
        const updatedUser = await Tritium.db.Limit.setLimit(msg.sender.id, dailyQuota);
        limit = updatedUser.limit;
    }

    if (!(limit > 0)) return true;
    else {
        await Tritium.db.Limit.setLimit(msg.sender.id, limit - 1);
        return false;
    }
}
