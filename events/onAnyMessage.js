const moment = require("moment");

// Checks before command execution should now be handled in command class :)
// TODO: only one db read at first & one write at end for performance boost
// TODO: optimize for speed

module.exports = async (Tritium, msg) => {
  try {
    // prettier-ignore
    console.log(Tritium.ccolor("[MSGLog]"), Tritium.ccolor(msg.sender.pushname, "grey"), msg.chat.name, Tritium.ccolor(msg.type, "grey"), msg.type === "chat" ? msg.body : "(data64)");

    if (Tritium.DEV && msg.sender.id !== Tritium.config.youb_id) return;

    // prettier-ignore
    msg.reply = function (content) {Tritium.reply(this.from, content, this.id);};

    /* prettier-ignore */
    // eslint-disable-next-line
    Tritium.getAmountOfLoadedMessages().then((msg) => {if (msg >= 1500) {Tritium.cutMsgCache();Tritium.sendText(Tritium.config.youb_id,"Cleared msg cache ! It was at " +msg +" messages.\n" +`On ${moment().format("HH:mm")}`);}});

    if (!msg.sender || msg.sender.isMe || (!msg.body && !msg.caption)) return;

    let body = msg.body;

    const bL = body.toLowerCase();
    if (bL === "hi" || bL === "hey" || bL === "hello") {
      await msg.reply(`👋 *Hello ${msg.sender.pushname} !*`);
      if (!msg.isGroupMsg) return Tritium.helpThisPoorMan(msg);
    }
    if (bL === "gn" || bL === "good night" || bL === "night")
      return msg.reply(`_*🌃 good night ${msg.sender.pushname} !*_`);

    if (bL === "nik") {
      msg.reply(`_*🌃 good night ${msg.sender.pushname} !*_`);
      return;
    }

    // * Helpa functions :D * //
    msg.groupId = msg.isGroupMsg ? msg.chat.groupMetadata.id : undefined;
    // * Helpa functions :D * //

    // *** Prefix+ ***
    let prefix = Tritium.config.default_prefix;
    if (msg.isGroupMsg) prefix = await Tritium.db.Settings.getPrefix(msg.groupId);
    // *** Prefix ***

    console.log(prefix);

    // *** Experience ***
    if (msg.isGroupMsg) {
      const randXp = Math.floor(Math.random() * 11) + 1;
      const hasLeveledUp = await Tritium.db.Experience.appendXp(msg.sender.id, msg.groupId, randXp, 5000);
      if (!Tritium.DEV && hasLeveledUp) {
        const user = await Tritium.db.Experience.fetch(msg.sender.id, msg.groupId);
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
    }
    /* body =
      msg.type === "chat" && body.startsWith(prefix)
        ? body
        : msg.type === "image" || msg.type === "video"
        ? msg.caption && msg.caption.startsWith(prefix)
          ? msg.caption
          : ""
        : ""; */
    if (!body) return;

    const args = body.slice(prefix.length).trim().split(/[ ]+/g);
    const cmdName = args.shift().toLowerCase();
    const cleanArgs = args.join(" ");

    const command = Tritium.commands.find((c) => c.props.triggers.includes(cmdName));
    if (!command) return console.log(`=> Unregistered ${cmdName} from ${msg.sender.id}`);

    console.log(
      Tritium.ccolor(`${msg.sender.pushname} (${msg.sender.id}) ran command => ${cmdName}`, "lightgreen"),
    );
    Tritium.ranCommands++;
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
    // midnight thing
    const dailyQuota = 5;
    if (!command.props.isNotQuotaLimited) {
      const lastUpdated = await Tritium.db.Limit.getLastUpdated(msg.sender.id);
      let limit = await Tritium.db.Limit.getLimit(msg.sender.id);

      const today = new Date();
      const midnight = new Date();
      // Get next day time
      midnight.setDate(today.getDate() + 1);
      midnight.setHours(0);
      midnight.setMinutes(0);

      // a day in ms : 86400000
      console.log(today.getTime(), "now time");
      console.log(midnight.getTime(), "midnight");
      console.log(lastUpdated, "lastupdated");
      console.log("isNewDay?", midnight.getTime() - lastUpdated < 0);

      // If lastupdated was the day before
      const isNewDay = Boolean(midnight.getTime() - lastUpdated < 0);
      if (isNewDay) {
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

    // Run the command
    await command.run({
      Tritium,
      msg,
      args,
      cleanArgs,
      chatPrefix: prefix,
    });

    // updateCD();
  } catch (error) {
    console.log(error);
  }
};
