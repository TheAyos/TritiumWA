const wa = require('@open-wa/wa-automate')
const Enmap = require('enmap');
const fs = require('fs');

const launch_options = require('./utils/launch_options')
const config = require('./config.json')

const msgHandler = require('./handler/handler')
const utils = require('./utils/utils')

wa.create(launch_options(true, start)).then(client => start(client)).catch((error) => console.log(error));
function start(client) {
  client.config = config;
  client.prefix = config.prefix;

  console.log('[DEV] Tritium');
  console.log('[CLIENT] Client Started! with prefix -> \'' + client.prefix + '\' \n\n');

  client.utils = utils;
  client.commands = new Enmap();

  // Command loader
  fs.readdir("./commands/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
      if (!file.endsWith(".js")) return;
      let props = require(`./commands/${file}`);
      let commandName = file.split(".")[0];
      console.log(`☄️  Loading command ${commandName}..`);
      client.commands.set(commandName, props);
    });
  });


  // Log all messages
  client.onAnyMessage((msg) => {
    if (msg.sender.isMe) return;
    console.log('[MSGLog] (' + msg.sender.id + ')', msg.type, msg.body);
  });

  // Force it to keep the current session
  client.onStateChanged((state) => {
    console.log('[Client State]', state);
    if (state === 'CONFLICT' || state === 'DISCONNECTED') client.forceRefocus();
  });

  client.onMessage(async (message) => {
    client.getAmountOfLoadedMessages().then((msg) => (msg >= 3000) && client.cutMsgCache());
    msgHandler(client, message);
  });

  client.onAddedToGroup((chat) => {
    client.sendText(chat.groupMetadata.id, `Thanks for adding me *${chat.contact.name}*. Use ${client.prefix}help to see the usable commands`)
  });

  client.onIncomingCall(async (call) => {
    client.sendText(call.peerJid, "What up ?");
  });

}