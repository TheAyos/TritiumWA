// Enables the use of the '@' shortcuts defined in package.json :D
require("module-alias/register");

const { create, Client } = require("@open-wa/wa-automate");

// TODO: RULE FOR ALL: GET THINGS DONE ASAP & then work on refactoring / ...

// TODO: IDEA: hot waifu lvl requirement: 5 ... etc
// TODO: IDEA: insta filterss w/ subcommands
// TODO: IDEA: insta filterss that you unlock with xp
// TODO: ++IDEA: high xp ppl have a boost every week they can spend for someone that uses the bot !!

/** @param {Client} Tritium */
async function start(Tritium) {
  Tritium.utils = require("./utils/utils");
  Tritium.config = require("./config.json");
  Tritium.prefix = Tritium.config.default_prefix;
  Tritium.minMems = 25;

  Tritium.ranCommands = 0;

  Tritium.aliases = new Map();
  Tritium.commands = new Map();
  Tritium.cooldowns = new Map();

  Tritium.hostNumber = await Tritium.getHostNumber();
  Tritium.hostId = `${Tritium.hostNumber}@c.us`;

  require("./utils/functions")(Tritium);

  // Hum
  const { mongo_db_path } = require("./config.json");
  const Experience = require("./utils/Experience");
  const Settings = require("./utils/Settings");
  Experience.connect(mongo_db_path);
  Settings.connect(mongo_db_path);

  require("./handlers/CommandLoader")(Tritium);
  require("./handlers/EventLoader")(Tritium);

  console.log(Tritium.aliases);
  console.log(Tritium.commands);

  /* let processMessage = (msg) => {
    Tritium.sendSeen(msg.chat.id);
    const moment = require("moment-timezone");
    let howMuchSecs = moment.duration(moment() - moment(msg.t * 1000)).asSeconds();
    if (howMuchSecs > 60 * 5) return; // Only process messages that are up to 5 minutes old
    console.log("Catched msg from " + howMuchSecs + " secs ago.");
    let msgEvent = require(Tritium.fromRootPath("events", "onAnyMessage.js"));
    msgEvent.bind(msg, Tritium);
  };

  //const unreadMessages = await Tritium.getAllUnreadMessages();
  //unreadMessages.forEach(processMessage); */

  Tritium.ccolor = (t, c) => {
    switch (c) {
      case "lightred":
        return `\x1b[1m\x1b[31m${t}\x1b[0m`;
      case "red":
        return `\x1b[31m${t}\x1b[0m`;
      case "beige":
        return `\x1b[1m\x1b[33m${t}\x1b[0m`;
      case "yellow":
        return `\x1b[33m${t}\x1b[0m`;
      case "grey":
        return `\x1b[1m\x1b[30m${t}\x1b[0m`;
      case "lightgreen":
        return `\x1b[1m\x1b[32m${t}\x1b[0m`;
      case "green":
      default:
        return `\x1b[32m${t}\x1b[0m`;
    }
  };

  Tritium.sendText(Tritium.config.youb_id, `Started 🌌 Tritium at ${require("moment")().format("HH:mm")}`);

  process.on("SIGINT", () => {
    Tritium.kill();
    console.log("\x1b[1m\x1b[33m\x1b[40mKilled by SIGINT, TRITIUM Stopped.");
    process.exit(1);
  });

  console.log(Tritium.ccolor("💥TRITIUM Started 🔥⚡", "grey"));
  console.log(Tritium.ccolor("💥TRITIUM Started 🔥⚡", "beige"));
  console.log(Tritium.ccolor("💥TRITIUM Started 🔥⚡"));
  console.log(Tritium.ccolor("💥TRITIUM Started 🔥⚡", "red"));
  console.log(Tritium.ccolor("💥TRITIUM Started 🔥⚡", "lightgreen"));

  /* let minMembers = 15;
  const groups = await Tritium.getAllGroups();
  await groups.forEach(async (g) => {
    //let chat = await Tritium.getChatById(g.id);
    let memCount = g.groupMetadata.participants.length - 1;
    if (memCount <= 0) return;
    if (memCount < minMembers) {
      console.log(ccolor(g.name, "beige"), memCount, g.id);
      //Tritium.sendText(
          //g.id,
          //`Leaving group ${g.name} because it is less that less than ${minMembers} members.`,
        //);
    }
  }); */
}

create(require("./utils/launch_options")(true, start))
  .then((client) => start(client))
  .catch((error) => console.log(error));
