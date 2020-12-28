module.exports = (client) => {
    client.rootPath = require("path").resolve();
    client.fromRootPath = (...pathS) => require("path").join(client.rootPath, ...pathS);
    client.getCommand = function (args) {
        return args.triggers
            ? client.commands.find((cmd) => cmd.triggers.includes(args.triggers[0]))
            : client.commands.find((cmd) => cmd.triggers.includes(args));
    };

    client.getCmdAliases = function (args) {
        const cmdTriggers = client.getCommand(args).triggers;
        return cmdTriggers.filter((alias) => alias != cmdTriggers[0]);
    };

    client.helpThisPoorMan = (msg, cmd) =>
        client.getCommand("help").run({ client, message: msg, args: cmd.triggers[0] });

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
};
