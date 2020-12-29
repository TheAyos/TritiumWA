module.exports = (Tritium) => {
    Tritium.rootPath = require("path").resolve();
    Tritium.fromRootPath = (...pathS) => require("path").join(Tritium.rootPath, ...pathS);
    Tritium.getCommand = function (args) {
        return args.triggers
            ? Tritium.commands.find((cmd) => cmd.triggers.includes(args.triggers[0]))
            : Tritium.commands.find((cmd) => cmd.triggers.includes(args));
    };

    Tritium.getCmdAliases = function (args) {
        const cmdTriggers = Tritium.getCommand(args).triggers;
        return cmdTriggers.filter((alias) => alias != cmdTriggers[0]);
    };

    Tritium.helpThisPoorMan = (msg, cmd) =>
        Tritium.getCommand("help").run({ Tritium, message: msg, args: cmd.triggers[0] });

    process.on("uncaughtException", (err) => {
        const cleanErrorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
        //Tritium.logger
        console.log("error", `Uncaught Exception: ${cleanErrorMsg}`);
        process.exit(1);
    });

    process.on("unhandledRejection", (err) => {
        //Tritium.logger
        console.log("error", `Unhandled rejection: ${err}`);
    });
};
