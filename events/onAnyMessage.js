const { cColor: cc } = require("../utils/misc");

// Checks before command execution should now be handled in command class :)
// TODO: only one db read at first & one write at end for performance boost
// TODO: optimize for speed

module.exports = async (Tritium, msg) => {
  const start = Date.now();
  if (!msg.sender || msg.sender.isMe || (!msg.body && !msg.caption)) return;
  // if (Tritium.DEV && msg.sender.id !== Tritium.config.youb_id) return;
  console.log(
    `${cc("[Msg]")} ${msg.sender.pushname} | ${msg.chat.name} > ${msg.type === "chat" ? msg.body : "(data64)"}`,
  );

  // eslint-disable-next-line no-shadow
  const a = async (Tritium, msg) => {
    try {
      const loadedMessagesCache = Tritium.getAmountOfLoadedMessages();
      if (loadedMessagesCache >= 1500)
        Promise.all([
          Tritium.cutMsgCache().then(async () => console.log("this tho", await Tritium.cutChatCache())),
          Tritium.sendText(Tritium.config.youb_id, `Cleared ${loadedMessagesCache} messages.\n${Tritium.getSignature()}`),
        ]);

      msg.reply = function (content) {
        Tritium.reply(this.from, content, this.id);
      };

      if (!Tritium.DEV) {
        const bL = msg.body.toLowerCase();
        if (bL === "hi" || bL === "hey" || bL === "hello") {
          await msg.reply(`👋 *Hello ${msg.sender.pushname} !*`);
          if (!msg.isGroupMsg)
            return Tritium.reply(msg.from, Tritium.getFullHelpMsg(Tritium.config.defaults.prefix), msg.id);
          // if (!msg.isGroupMsg) return Tritium.helpThisPoorMan(msg); //TODO: not needed anymore ?
        }
        if (bL === "gn" || (bL.contains("good") && bL.contains("night")) || bL === "nik")
          return msg.reply(`_*🌃 good night ${msg.sender.pushname} !*_`);
      }

      // *** Helper functions ***
      msg.GROUP_ID = msg.isGroupMsg ? msg.chat.groupMetadata.id : undefined;

      // *** Prefix ***
      const prefix = msg.isGroupMsg ? await Tritium.db.Settings.getPrefix(msg.GROUP_ID) : Tritium.config.defaults.prefix;

      // TODO: custom level up message per-group
      // *** Experience ***
      if (msg.isGroupMsg) {
        const randXp = Math.floor(Math.random() * 11) + 1;
        const xpCooldown = 5000;
        const hasLeveledUp = await Tritium.db.Experience.appendXp(msg.sender.id, msg.GROUP_ID, randXp, xpCooldown);
        // FIXME: dev
        if (!Tritium.DEV && hasLeveledUp) {
          const user = await Tritium.db.Experience.fetch(msg.sender.id, msg.GROUP_ID);
          await Tritium.sendTextWithMentions(
            msg.from,
            `🎉 @${msg.sender.id.split("@").shift()}, congratulations!\n` +
              `You have leveled up to *level ${user.level}* 🥳\n` +
              `_🧬 use the ${prefix}xp command for more info._`,
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

      const args = body.slice(prefix.length).trim().split(/[ ]+/g);
      const cmdName = args.shift().toLowerCase();
      const cleanArgs = args.join(" ");

      const command = Tritium.commands.find((c) => c.props.triggers.includes(cmdName));
      if (!command) return console.log(`=> Unregistered ${cmdName} from ${msg.sender.id}`);

      Tritium.stats.commands.ran++;
      process.stdout.write(cc(`${msg.sender.pushname} (${msg.sender.id}) ran command ${cmdName}, `, "lightgreen"));
      console.log(cc(`${Tritium.stats.commands.ran} ran commands since startup`, "yellow"));

      // *** Cooldowns ***
      if (msg.sender.id !== Tritium.config.youb_id) {
        // no cooldown for me ;)
        const cooldowns = Tritium.cooldowns;
        if (!cooldowns.has(command.name)) {
          cooldowns.set(command.name, new Map());
        }
        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const commandCooldown = (command.props.cooldown || 3) * 1000;
        if (timestamps.has(msg.sender.id)) {
          const expirationTime = timestamps.get(msg.sender.id) + commandCooldown;

          if (now < expirationTime) {
            const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
            const msgId = await Tritium.sendText(
              msg.from,
              `You need to wait ${timeLeft}s before reusing \`${command.name}\` 😃`,
              true,
            );
            setTimeout(() => {
              Tritium.deleteMessage(msg.chat.contact.id, msgId);
              // console.log(`${msg.sender.id}'s cooldown for command ${command.name} expired !`, timestamps);
            }, commandCooldown);
            return;
          }
        } else {
          timestamps.set(msg.sender.id, now);
          // console.log(`${msg.sender.id} now has a cooldown for command ${command.name} of ${commandCooldown} seconds !`, timestamps);
          setTimeout(() => {
            timestamps.delete(msg.sender.id);
            // console.log(`${msg.sender.id}'s cooldown for command ${command.name} expired !`, timestamps);
          }, commandCooldown);
        }
      }

      // *** Quotas ***
      // TODO: selon levels, different quotas
      const dailyQuota = 20;
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
      }

      if (!(Tritium.DEV && msg.sender.id !== Tritium.config.youb_id)) {
        await command.run({
          Tritium,
          msg,
          args,
          cleanArgs,
          chatPrefix: prefix,
          usedAlias: cmdName,
        });
      }
      // TODO: updateCD();
    } catch (error) {
      console.log(error);
    }
  };
  await a(Tritium, msg);

  /* const { queue } = require("../main");
  queue.add(() =>
    setTimeout(
      () =>
        Tritium.deleteMessage(msg.chat.id, msg.id, true)
          .then(() => console.log("deleted msg"))
          .catch(),
      { priority: -6 },
      5 * 60 * 1000,
    ),
  );*/

  Tritium.MSG_TIME.push({ time: Date.now(), procTime: Date.now() - start });
  // Tritium.MSG_TIME.map((t) => console.log(t));
  const filteredProcessTimes = Tritium.MSG_TIME.filter((t) => t.time > Date.now() - 60 * 1000);
  Tritium.MSG_TIME = filteredProcessTimes;
  // Tritium.MSG_TIME.map((t) => console.log(t));
  const averageProcessTime = (
    filteredProcessTimes.map((t) => t.procTime).reduce((acc, val) => acc + val, 0) /
    filteredProcessTimes.map((t) => t.procTime).length
  ).toFixed(0);
  console.log(`Last minute avg procTime: ${averageProcessTime} ms`);

  console.log(cc(`Message processed in: ${Date.now() - start} ms`, "yellow"));
};
