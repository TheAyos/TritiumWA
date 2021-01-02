module.exports = async (client, msg) => {
  //client.getAmountOfLoadedMessages().then((msg) => msg >= 3000 && client.cutMsgCache());

  if (msg.sender.isMe || (!msg.body && !msg.caption)) return;
  console.log("[MSGLog] " + msg.sender.pushname, msg.type, msg.type === "chat" ? msg.body : "(data64)");

  let body = msg.body;

  if (body.toLowerCase() === "hi") {
    await client.reply(msg.from, `👋 *Hello ${msg.sender.pushname} !*`, msg.id);
    client.helpThisPoorMan(msg);
  }

  let prefix = client.prefix; //server prefix after that
  //prefix = msg.isGroupMsg ? msg.mentionedJidList ? msg.mentionedJidList.split("@").shift() === Tritium.hostNumber && body.startsWith(`@${Tritium.hostNumber}`) : prefix

  body =
    msg.type === "chat" && body.startsWith(prefix)
      ? body
      : (msg.type === "image" || msg.type === "video") && msg.caption.startsWith(prefix)
      ? msg.caption
      : "";

  if (!body) return;

  const args = body.slice(prefix.length).trim().split(/[ ]+/g);
  const cmdName = args.shift().toLowerCase();
  const cleanArgs = args.join(" ");

  const command = client.getCommand(cmdName);
  if (!command) return console.log(`=> Unregistered ${cmdName} from ${msg.sender.id}`);

  console.log(`${msg.sender.pushname} (${msg.sender.id}) ran command => ${cmdName}`);

  //// Checks before command execution
  // Checking if args are provided correctly now handled in command class :)

  //// Helpa functions :D
  msg.groupId = msg.isGroupMsg ? msg.chat.groupMetadata.id : "";

  // Run the command
  command.run({
    Tritium: client,
    msg,
    args,
    cleanArgs,
  });
};
