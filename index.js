const { create } = require("@open-wa/wa-automate");

const Enmap = require("enmap");

const msgHandler = require("./handler/handler");

function start(client) {
    client.utils = require("./utils/utils");
    client.WMStrm = require("./utils/WMStrm");
    client.config = require("./config.json");
    client.prefix = client.config.default_prefix;

    console.log("[DEV] Tritium");
    console.log(`[TRITIUM] Client Started!\n default prefix ->  '${client.prefix}' \n\n`);

    client.commands = new Enmap();
    client.aliases = new Enmap();

    require("./handler/CommandLoader")(client);
    require("./handler/EventLoader")(client);

    // for use if no args are given to a commands that needArgs
    client.helpThisPoorMan = client.commands.get("help").run;

    console.log();
    console.log("\x1b[1m\x1b[31m\x1b[40m");
    console.log(client.commands);
    console.log("\x1b[1m\x1b[31m\x1b[40m");
    console.log(client.aliases);
    console.log("\x1b[0m");

    client.onMessage(async (message) => {
        client.getAmountOfLoadedMessages().then((msg) => msg >= 3000 && client.cutMsgCache());
        msgHandler(client, message);
    });

    // fancystuff
    // implement client.logger first!!

    process.on("uncaughtException", (err) => {
        const cleanErrorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
        //client.logger
        console.log("error", `Uncaught Exception: ${cleanErrorMsg}`);
        process.exit(1);
    });

    process.on("unhandledRejection", (err) => {
        //client.logger
        console.log("error", `Unhandled rejection: ${err}`);
    });
}

create(require("./utils/launch_options")(true, start))
    .then((client) => start(client))
    .catch((error) => console.log(error));
