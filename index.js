const { create } = require("@open-wa/wa-automate");
const Enmap = require("enmap");

function start(client) {
    client.utils = require("./utils/utils");
    client.config = require("./config.json");
    client.prefix = client.config.default_prefix;

    client.aliases = new Enmap();
    client.commands = new Enmap();
    client.settings = new Enmap({ name: "settings" });

    require("./handlers/CommandLoader")(client);
    require("./handlers/EventLoader")(client);

    client.helpThisPoorMan = client.commands.get("help").run;

    client.getCommand = function (args) {
        return args.triggers
            ? client.commands.find((cmd) => cmd.triggers.includes(args.triggers[0]))
            : client.commands.find((cmd) => cmd.triggers.includes(args));
    };
    client.getCmdAliases = function (args) {
        const cmdTriggers = client.getCommand(args).triggers;
        return cmdTriggers.filter((alias) => alias != cmdTriggers[0]);
    };
    client.commands.forEach((c) =>
        console.log(c.triggers[0], "=> aliases:", client.getCmdAliases(c)),
    );
    console.log();
    console.log(`[TRITIUM] Client Started!\n default prefix ->'${client.prefix}'`);
    console.log();
    console.log("💥🔥⚡");
    console.log();

    client.onMessage(async (message) => {
        //client.getAmountOfLoadedMessages().then((msg) => msg >= 3000 && client.cutMsgCache());
        require("./handlers/handler")(client, message);
    });

    /*console.log("\x1b[1m\x1b[31m\x1b[40m");console.log("\x1b[0m");*/

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
