// Checks before command execution should now be handled in command class :)
// TODO: only one db read at first & one write at end for performance boost
// TODO: optimize for speed

module.exports = async (Tritium, msg) => {
  const start = Date.now();

  // eslint-disable-next-line no-shadow
  const a = async (Tritium, msg) => {
    try {
      // prettier-ignore
      console.log(Tritium.ccolor("[MSGLog]"), Tritium.ccolor(msg.sender.pushname, "grey"), msg.chat.name, Tritium.ccolor(msg.type, "grey"), msg.type === "chat" ? msg.body : "(data64)");

      // if (Tritium.DEV && msg.sender.id !== Tritium.config.youb_id) return;

      // prettier-ignore
      msg.reply = function (content) {Tritium.reply(this.from, content, this.id);};

      /* prettier-ignore */
      // eslint-disable-next-line
      await Tritium.getAmountOfLoadedMessages().then(async (msg) => {if (msg >= 1500) {await Tritium.cutMsgCache();await Tritium.sendText(Tritium.config.youb_id,"Cleared msg cache ! " + msg + " messages.\n" + Tritium.getSignature());}});

      if (!msg.sender || msg.sender.isMe || (!msg.body && !msg.caption)) return;

      let body = msg.body;

      if (!(Tritium.DEV && msg.sender.id !== Tritium.config.youb_id)) {
        const bL = body.toLowerCase();
        if (bL === "hi" || bL === "hey" || bL === "hello") {
          await msg.reply(`👋 *Hello ${msg.sender.pushname} !*`);
          // if (!msg.isGroupMsg) return Tritium.helpThisPoorMan(msg);
          if (!msg.isGroupMsg)
            return Tritium.reply(msg.from, Tritium.getFullHelpMsg(Tritium.config.defaults.prefix), msg.id);
        }
        if (bL === "gn" || bL === "good night" || bL === "night")
          return msg.reply(`_*🌃 good night ${msg.sender.pushname} !*_`);

        if (bL === "nik") {
          msg.reply(`_*🌃 good night ${msg.sender.pushname} !*_`);
          return;
        }
      }

      // * Helpa functions :D * //
      msg.GROUP_ID = msg.isGroupMsg ? msg.chat.groupMetadata.id : undefined;
      // * Helpa functions :D * //

      // *** Prefix+ ***
      const prefix = msg.isGroupMsg ? await Tritium.db.Settings.getPrefix(msg.GROUP_ID) : Tritium.config.defaults.prefix;
      // *** Prefix ***

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
      // *** Experience ***

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

      Tritium.ranCommands++;
      console.log(Tritium.ccolor(`${msg.sender.pushname} (${msg.sender.id}) ran command => ${cmdName}`, "lightgreen"));
      console.log(Tritium.ccolor(`${Tritium.ranCommands} ran commands`, "yellow"));

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
      // *** Cooldowns ***

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
          console.log(Tritium.ccolor(`${msg.sender.pushname} exceeded his daily quota`, "red"));
          return msg.reply(`You exceeded your daily quota (${dailyQuota} command uses)`);
        }

        await Tritium.db.Limit.setLimit(msg.sender.id, limit - 1);
      }
      // *** Quotas ***

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
  // async function end
  console.log(Tritium.ccolor(`Message processed in: `, "yellow"), Tritium.ccolor(Date.now() - start + " ms", "lightred"));
};
