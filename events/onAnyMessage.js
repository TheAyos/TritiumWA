const { cColor: cc } = require("../utils/misc");

const { default: PQueue } = require("p-queue");
const queue = new PQueue({ concurrency: 7, autoStart: true });

// Checks before command execution should now be handled in command class :)

// ME, ANAS, SALMA
const VIP_PEOPLE = ["212641715835", "212671421331", "212648539080"];

async function cleanMsgCacheIfNeeded(Tritium) {
    const loadedMessagesCache = await Tritium.getAmountOfLoadedMessages();
    if (loadedMessagesCache >= 666) {
        const afterCutInfo = await Tritium.cutChatCache();
        const caption =
            `Msgs cache reached ${loadedMessagesCache} messages. Cleaning...\n` +
            `Went from ${afterCutInfo.before.chats} chats and ${afterCutInfo.before.msgs} msgs.\n` +
            `To ${afterCutInfo.after.chats} chats and ${afterCutInfo.after.msgs} msgs.\n${Tritium.getSignature()}`;
        Tritium.sendText(Tritium.config.youb_id, caption);
    }
}

module.exports = async (Tritium, msg) => {
    if (!msg.sender || msg.sender.isMe || (!msg.body && !msg.caption)) return;

    const start = Date.now();
    const xpCooldown = Tritium.config.experienceCooldownMs;

    msg.sender.PHONE_NUMBER = msg.sender.id.split("@").shift();
    msg.sender.IS_VIP = VIP_PEOPLE.includes(msg.sender.id.split("@").shift());
    msg.reply = function (content) { Tritium.reply(this.from, content, this.id); }; /* prettier-ignore */

    // Testing mode
    if (!VIP_PEOPLE.includes(msg.sender.PHONE_NUMBER)) return;

    Tritium.log(`${msg.type === "chat" ? msg.body : "(data64 or other)"}`, `${msg.sender.IS_VIP ? "(VIP) " : ""}${msg.sender.pushname} | ${msg.chat.name}`);

    // *** Temporary ***
    if (msg.sender.id === Tritium.config.youb_id && msg.body === ".stats") {
        const averageProcessTime = (Tritium.MSG_TIME.map((t) => t.procTime).reduce((acc, val) => acc + val, 0) / Tritium.MSG_TIME.map((t) => t.procTime).length).toFixed(0);
        await Tritium.sendText(msg.from, "*Last minute avg procTime: _" + averageProcessTime + "_ ms*");
    }

    try {
        cleanMsgCacheIfNeeded(Tritium);

        const bL = msg.body.toLowerCase();
        if (bL === "hi" || bL === "hey" || bL === "hello") {
            await msg.reply(`👋 *Hello ${msg.sender.pushname} !*`);
            if (!msg.isGroupMsg) return Tritium.reply(msg.from, Tritium.getFullHelpMsg(Tritium.config.prefix), msg.id);
            // if (!msg.isGroupMsg) return Tritium.helpThisPoorMan(msg); //TODO: not needed anymore ?
        }
        if (bL === "gn" || (bL.includes("good") && bL.includes("night")) || bL === "nik") return msg.reply(`_*🌃 good night ${msg.sender.pushname} !*_`);
        const wordInString = (s, word) => new RegExp('\\b' + word + '\\b', 'i').test(s);
        if (["jordi", "nino", "pola"].map((s) => wordInString("jdordi ninod polaa", s)).reduce((a, b) => a || b)) return msg.reply(`_*Father ?*_`);
        if ((bL.includes("mia") && bL.includes("khalifa")) || bL.includes("khalifa")) return msg.reply(`_*Mamma ?*_`);
        if (bL.includes("fuck me")) return msg.reply(`_*Let's do that !*_`);
        if (bL.includes("fuck me pls")) return msg.reply(`_*Let's do that ! Now.*_`);
        if (bL.includes("wanna go out ?")) return msg.reply(`_*i'm up*_`);
        if (bL.includes("i need a gf")) return msg.reply(`_*pick ya up at 8 ?*_`);

        // *** Helper functions ***
        msg.GROUP_ID = msg.isGroupMsg ? msg.chat.groupMetadata.id : undefined;

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
        if (msg.type === "chat" && body.startsWith(prefix)) {
            body = msg.body;
        } else if (msg.type === "image" || msg.type === "video") {
            if (msg.caption && msg.caption.startsWith(prefix)) {
                body = msg.caption;
            }
        } else return;

        /* let bbody =
      msg.type === "chat" && msg.body.startsWith(prefix)
        ? msg.body
        : (msg.type === "image" || msg.type === "video") && msg.caption && msg.caption.startsWith(prefix)
        ? msg.caption
        : undefined;

    console.log(bbody);*/

        const args = body.slice(prefix.length).trim().split(/[ ]+/g);
        const cmdName = args.shift().toLowerCase();
        const cleanArgs = args.join(" ");

        const command = Tritium.commands.find((c) => c.props.triggers.includes(cmdName));
        if (!command) return Tritium.log(`=> Unregistered ${cmdName} from ${msg.sender.id}`);

        Tritium.stats.commands.ran++;
        // process.stdout.write(cc(`${msg.sender.pushname} (${msg.sender.id}) ran command ${cmdName}, `, "lightgreen"));
        Tritium.log(`ran command ${cmdName}`, `${msg.sender.pushname} (${msg.sender.id})`);
        Tritium.log(cc(`${Tritium.stats.commands.ran} ran commands since startup`, "yellow"));

        /* // *** Quotas *** // TODO: selon levels, different quotas
    const dailyQuota = Tritium.config.dailyQuota;
    if (!command.props.isNotQuotaLimited && msg.sender.id !== Tritium.config.youb_id) {
      const lastUpdated = await Tritium.db.Limit.getLastUpdated(msg.sender.id);
      let limit = await Tritium.db.Limit.getLimit(msg.sender.id);

      const midnight = new Date(new Date().setHours(24, 0, 0, 0));

      console.log(midnight.getTime(), "midnight");
      console.log(lastUpdated, "lastupdated");
      console.log("should reset quota ?", midnight - lastUpdated > 86400000);

      // A day in ms : 86400000 (60*60*24*1000)
      if (midnight - lastUpdated > 86400000) {
        const updatedUser = await Tritium.db.Limit.setLimit(msg.sender.id, dailyQuota);
        limit = updatedUser.limit;
      }

      if (!(limit > 0)) {
        console.log(cc(`${msg.sender.pushname} exceeded his daily quota`, "red"));
        return msg.reply(`You exceeded your daily quota (${dailyQuota} command uses)`);
      }

      await Tritium.db.Limit.setLimit(msg.sender.id, limit - 1);
    }*/

        await command.run({ Tritium, msg, args, cleanArgs, chatPrefix: prefix, usedAlias: cmdName, updateCooldowns });

        // see updateCD();
    } catch (error) {
        Tritium.error(error);
    }

    // *** Cooldowns ***
    async function updateCooldowns(command) {
        if (msg.sender.id === Tritium.config.youb_id) return false;
        if (!Tritium.cooldowns.has(command.name)) {
            Tritium.cooldowns.set(command.name, new Map());
        }
        const now = Date.now();
        const timestamps = Tritium.cooldowns.get(command.name);
        const commandCooldown = command.props.cooldown * 1000;
        if (timestamps.has(msg.sender.id)) {
            const expirationTime = timestamps.get(msg.sender.id) + commandCooldown;
            if (now < expirationTime) {
                const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
                const msgId = await Tritium.sendText(msg.from, `You need to wait ${timeLeft}s before reusing \`${command.name}\` 😃`, true);
                setTimeout(
                    () =>
                        queue.add(
                            async () => await Tritium.deleteMessage(msg.chat.contact.id, msgId),
                            // && console.log(`${msg.sender.id}'s cooldown for command ${command.name} expired !`, timestamps),
                            { priority: 0 },
                        ),
                    expirationTime - now,
                    // commandCooldown,
                );
                return true;
            }
        } else {
            timestamps.set(msg.sender.id, now);
            // console.log(`${msg.sender.id} now has a cooldown for command ${command.name} of ${commandCooldown} seconds !`, timestamps);
            setTimeout(() => {
                timestamps.delete(msg.sender.id);
                // console.log(`${msg.sender.id}'s cooldown for command ${command.name} expired !`, timestamps);
            }, commandCooldown);
            return false;
        }
    }

    /* setTimeout(
    () =>
      queue.add(
        () =>
          Tritium.deleteMessage(msg.chat.id, msg.id, true)
            .then(() => console.log(cc("deleted msg after ", "grey"), Date.now() - msg.timestamp))
            .catch(),
        { priority: -1 },
      ),
    5 * 60 * 1000,
  );*/

    // *** Stats ***
    Tritium.MSG_TIME.push({ time: Date.now(), procTime: Date.now() - start });
    const filteredProcessTimes = Tritium.MSG_TIME.filter((t) => t.time > Date.now() - 60 * 1000); // keep process times for 1 minute
    Tritium.MSG_TIME = filteredProcessTimes;
    const averageProcessTime = (filteredProcessTimes.map((t) => t.procTime).reduce((acc, val) => acc + val, 0) / filteredProcessTimes.map((t) => t.procTime).length).toFixed(0);

    Tritium.log(cc(`1 min procTime avg: ${averageProcessTime} ms`));
    Tritium.log(cc(`Message processed in: ${Date.now() - start} ms`, "yellow"));
    Tritium.log(cc(`Queue size | pending | concurrency:`, "lightyellow"));
    Tritium.log(`      ${queue.size}    |    ${queue.pending}    |      ${queue.concurrency}`);
    // *** Stats ***
};
