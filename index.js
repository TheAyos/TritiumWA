const { create, Client } = require('@open-wa/wa-automate')
const launch_options = require('./utils/launch_options')

const Enmap = require('enmap');

const config = require('./config.json')
const msgHandler = require('./handler/handler')
const utils = require('./utils/utils')

/// WOOWOWOWO RED COLOR MAMAMIAAAA
console.log("\x1b[1m\x1b[31m\x1b[40m\x1b[1m\x1b[31m\x1b[40m" + `WIN32 IS NOT OFFICIALLY SUPPORTED!
Although there's a (very) slim chance of it working, multiple aspects of the bot are built with UNIX-like systems in mind and could break on Win32-based systems. If you want to run the bot on Windows, using Windows Subsystem for Linux is highly recommended.
The bot will continue to run past this message, but keep in mind that it could break at any time. Continue running at your own risk; alternatively, stop the bot using Ctrl+C and install WSL.` + "\x1b[0m");

function start(client) {

  client.config = config;
  client.prefix = config.prefix;
  client.utils = utils;



  console.log('[DEV] Tritium');
  console.log('[CLIENT] Client Started! with prefix -> \'' + client.prefix + '\' \n\n');



  client.commands = new Enmap();
  client.aliases = new Enmap();
  client.helps = new Enmap();

  require('./CommandLoader')(client)

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


create(launch_options(true, start))
  .then(client => start(client))
  .catch((error) => console.log(error));
