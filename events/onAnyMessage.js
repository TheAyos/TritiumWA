module.exports = async (client, msg) => {
  //require(client.fromRootPath("handlers/handler.js"))(client, msg);
  //client.getAmountOfLoadedMessages().then((msg) => msg >= 3000 && client.cutMsgCache());

  if (msg.sender.isMe || (!msg.body && !msg.caption)) return;
  console.log("[MSGLog] " + msg.sender.pushname, msg.type, msg.type === "chat" ? msg.body : "(data64)");

  let body = msg.body;

  const prefix = client.prefix; //server prefix after that

  body =
    msg.type === "chat" && body.startsWith(prefix)
      ? body
      : (msg.type === "image" || msg.type === "video") && msg.caption && msg.caption.startsWith(prefix)
      ? msg.caption
      : "";

  if (!body) return;

  if (body.toLowerCase() === "hi") {
    await client.reply(msg.from, `👋 *Hello ${msg.sender.pushname} !*`, msg.id);
    client.getCommand("help").run({ Tritium: client, message: msg, args: [] });
  }

  const cleanArgs = body.slice(prefix.length).trim();
  const args = cleanArgs.split(/ +/);
  const cmdName = args.shift().toLowerCase();

  const command = client.getCommand(cmdName);
  if (!command) return console.log(`=> Unregistered ${cmdName} from ${msg.sender.id}`);

  //// Checks before command execution

  if (!msg.isGroupMsg && command.groupOnly);

  if (command.needArgs && !args.length) return client.helpThisPoorMan(msg, command);

  //// Helpa functions :D
  msg.groupId = msg.isGroupMsg ? msg.chat.groupMetadata.id : "";

  // Run the command
  try {
    command.run({
      Tritium: client,
      msg,
      message: msg,
      args,
      cleanArgs,
    });
    //cmd.run(client, msg, args, cleanArgs);
  } catch (error) {
    client.simulateTyping(msg.from, false);
    console.log(error);
  }
};
