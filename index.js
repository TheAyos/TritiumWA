// Enables the use of the '@' shortcuts defined in package.json :D
require("module-alias/register");

const { create } = require("@open-wa/wa-automate");
const Enmap = require("enmap");

// TODO: RULE FOR ALL: GET THINGS DONE ASAP & then work on refactoring / ...

// TODO: FIRST OF ALL implement good cmd handling with args & co...
// TODO: THEN STOP PAUSE TO BE MORE PRODUCTIVE AND LIVE LIFE !!!!!

// TODO: THEEEEEN AFTER PAUSE im gonna be ready to work on quality commands and not waste time
// TODO: IDEA: hot waifu lvl requirement: 3 ... etc
// TODO: IDEA: insta filterss w/ subcommands
// TODO: IDEA: insta filterss that you unlock with xp
// TODO: IDEA: ask ppl for xp : should it be tracked by server or by user ?
// TODO: IDEA: xp tracked by user & gain a lot on servers => this will encourage ppl to use my bot everywhere (dms & groups)
// TODO: IDEA: use a solid DB & store data by user !!!

// TODO: ++IDEA: high xp ppl have a boost every week they can spend for someone that uses the bot !!

function start(Tritium) {
  Tritium.utils = require("./utils/utils");
  Tritium.config = require("./config.json");
  Tritium.prefix = Tritium.config.default_prefix;

  Tritium.aliases = new Enmap();
  Tritium.commands = new Enmap();
  //Tritium.settings = new Enmap({ name: "settings" });

  //Tritium.hostNumber = await Tritium.getHostNumber();
  require("./utils/functions")(Tritium);
  require("./handlers/CommandLoader")(Tritium);
  require("./handlers/EventLoader")(Tritium);

  Tritium.logger.info("💥TRITIUM Started 🔥⚡");
  Tritium.logger.warn("💥TRITIUM Started 🔥⚡");
  Tritium.logger.error("💥TRITIUM Started 🔥⚡");

  /*console.log("\x1b[1m\x1b[31m\x1b[40m");console.log("\x1b[0m");*/
}

create(require("./utils/launch_options")(true, start))
  .then((client) => start(client))
  .catch((error) => console.log(error));
