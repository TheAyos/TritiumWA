const { Client } = require("@open-wa/wa-automate");

/** @param {Client} client @param {*} msg */
module.exports = async (client, msg) => {
  if (!msg.isGroupMsg) return;

  // it weurks
  msg.reply = function (content) {
    client.reply(this.from, content, this.id);
  };

  // TODO: optimize for speed

  try {
    client.getAmountOfLoadedMessages().then((msg) => {
      if (msg >= 1500) {
        client.cutMsgCache();
        client.sendText(
          client.config.youb_id,
          "Cleared msg cache ! It was at " +
            msg +
            " messages.\n" +
            `On ${require("moment")().format("HH:mm")}`,
        );
      }
    });

    if (!msg.sender || msg.sender.isMe || (!msg.body && !msg.caption)) return;
    /* console.log(
      client.ccolor("[MSGLog]"),
      client.ccolor(msg.sender.pushname, "grey"),
      msg.chat.name,
      client.ccolor(msg.type, "grey"),
      msg.type === "chat" ? msg.body : "(data64)",
    ); */

    let body = msg.body;

    const bL = body.toLowerCase();
    if (bL === "hi" || bL === "hey" || bL === "hello") {
      await msg.reply(`👋 *Hello ${msg.sender.pushname} !*`);
      if (!msg.isGroupMsg) return client.helpThisPoorMan(msg);
    }
    if (bL === "gn" || bL === "good night" || bL === "night")
      return msg.reply(`_*🌃 good night ${msg.sender.pushname} !*_`);

    if (bL === "nik") {
      msg.reply(`_*🌃 good night ${msg.sender.pushname} !*_`);
      return;
    }

    // * Helpa functions :D * //
    msg.groupId = msg.isGroupMsg ? msg.chat.groupMetadata.id : "";
    // * Helpa functions :D * //

    // * Prefix & Xp handling * //
    let prefix = client.prefix;

    if (msg.isGroupMsg) {
      const Settings = require("../utils/Settings");
      prefix = await Settings.getPrefix(msg.groupId);

      const Experience = require("../utils/Experience");

      const randXp = Math.floor(Math.random() * 11) + 1;
      const hasLeveledUp = await Experience.appendXp(msg.sender.id, msg.groupId, randXp, 5000);
      if (hasLeveledUp) {
        const user = await Experience.fetch(msg.sender.id, msg.groupId);
        client.sendTextWithMentions(
          msg.from,
          `🎉 @${msg.sender.id.split("@").shift()}, congratulations!\n` +
            `You have leveled up to *level ${user.level}* 🥳\n` +
            `_🧬 use the ${prefix}xp command for more info._`,
        );
      }
    }
    // * Prefix & Xp handling * //

    body =
      msg.type === "chat" && body.startsWith(prefix)
        ? body
        : msg.type === "image" || msg.type === "video"
        ? msg.caption && msg.caption.startsWith(prefix)
          ? msg.caption
          : ""
        : "";

    if (!body) return;

    const args = body.slice(prefix.length).trim().split(/[ ]+/g);
    const cmdName = args.shift().toLowerCase();
    const cleanArgs = args.join(" ");

    // const command = client.getCommand(cmdName);
    const command = client.commands.find((c) => c.props.triggers.includes(cmdName));
    if (!command) return console.log(`=> Unregistered ${cmdName} from ${msg.sender.id}`);

    console.log(
      client.ccolor(`${msg.sender.pushname} (${msg.sender.id}) ran command => ${cmdName}`, "lightgreen"),
    );
    client.ranCommands++;
    console.log(client.ccolor(`${client.ranCommands} ran commands`, "yellow"));

    // * Cooldown handling * //
    if (msg.sender.id !== client.config.youb_id) {
      // no cooldown for me ;)
      const cooldowns = client.cooldowns;
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
          const msgId = await client.sendText(
            msg.from,
            `You need to wait ${timeLeft}s before reusing \`${command.name}\` 😃`,
            true,
          );
          setTimeout(() => {
            client.deleteMessage(msg.chat.contact.id, msgId);
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
    // * Cooldown handling * //

    // Checks before command execution should now be handled in command class :)

    // TODO: only one db read at first & one write at end for performance boost

    if (!command.props.isNotQuotaLimited) {
      const Limit = require("../utils/Limit");
      const lastUpdated = await Limit.getLastUpdated(msg.sender.id);
      let limit = await Limit.getLimit(msg.sender.id);

      const today = new Date();
      const midnight = new Date();
      midnight.setDate(today.getDate() + 1); // Get next day time
      midnight.setHours(0);
      midnight.setMinutes(0);

      console.log(today.getTime(), "now time");
      console.log(midnight.getTime(), "midnight");
      console.log(lastUpdated, "lastupdated");
      console.log("isNewDay?", midnight.getTime() - lastUpdated < 0);

      // If lastupdated was the day before
      const isNewDay = Boolean(midnight.getTime() - lastUpdated < 0);
      if (isNewDay) {
        const updatedUser = await Limit.setLimit(msg.sender.id, 50);
        limit = updatedUser.limit;
      }

      if (!(limit > 0)) {
        console.log(client.ccolor(`${msg.sender.pushname} exceeded his daily quota`, "red"));
        return msg.reply("You exceeded your daily quota (50 command uses)");
      }

      await Limit.setLimit(msg.sender.id, limit - 1);
    }

    // Run the command
    await command.run({
      Tritium: client,
      msg,
      args,
      cleanArgs,
      chatPrefix: prefix,
    });

    // await client.sendSeen(msg.chat.id);
    // updateCD();
  } catch (error) {
    console.log(error);
  }
};
