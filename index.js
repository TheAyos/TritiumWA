const { create } = require("@open-wa/wa-automate");
const Enmap = require("enmap");

function start(Tritium) {
    Tritium.utils = require("./utils/utils");
    Tritium.config = require("./config.json");
    Tritium.prefix = Tritium.config.default_prefix;

    Tritium.aliases = new Enmap();
    Tritium.commands = new Enmap();
    Tritium.settings = new Enmap({ name: "settings" });

    require("./utils/functions")(Tritium);
    require("./handlers/CommandLoader")(Tritium);
    require("./handlers/EventLoader")(Tritium);

    console.log("\nTRITIUM Client Started 💥🔥⚡\n");

    /*console.log("\x1b[1m\x1b[31m\x1b[40m");console.log("\x1b[0m");*/
}

create(require("./utils/launch_options")(true, start))
    .then((client) => start(client))
    .catch((error) => console.log(error));
