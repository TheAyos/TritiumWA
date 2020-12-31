module.exports = (Tritium) => {
  Tritium.rootPath = require("path").resolve();
  Tritium.fromRootPath = (...pathS) => require("path").join(Tritium.rootPath, ...pathS);
  Tritium.getCommand = function (args) {
    return typeof args === "string"
      ? Tritium.commands.find((cmd) => cmd.triggers.includes(args))
      : Tritium.commands.find((cmd) => cmd.triggers.includes(args.triggers[0]));
  };

  Tritium.getCmdAliases = function (args) {
    const cmdTriggers = Tritium.getCommand(args).triggers;
    return cmdTriggers.filter((alias) => alias != cmdTriggers[0]);
  };

  /**
   * Returns a string with the number in its ordinal form
   */
  Number.prototype.toOrdinal = function () {
    return this.toString().slice(-1) === "1"
      ? `${this}st`
      : this.toString().slice(-1) === "2"
      ? `${this}nd`
      : this.toString().slice(-1) === "3"
      ? `${this}rd`
      : `${this}th`;
  };

  /**
   * Returns a random value from the given array
   */
  Array.prototype.getRandom = function () {
    return this[Math.floor(Math.random() * (this.length - 0 + 1)) + 0];
  };

  /**
   * Scrambles and returns the given array
   */
  Array.prototype.toScrambled = function () {
    return this.sort(() => Math.random() - 0.5);
  };

  Tritium.helpThisPoorMan = (msg, cmd) =>
    Tritium.getCommand("help").run({
      Tritium,
      message: msg,
      args: Tritium.getCommand(cmd).triggers[0],
    });

  process.on("uncaughtException", (error) => {
    const cleanErrorMsg = error.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
    //Tritium.logger
    console.log("error", `Uncaught Exception: ${cleanErrorMsg}`);
    process.exit(1);
  });

  process.on("unhandledRejection", (error) => {
    //Tritium.logger
    console.log("error", `Unhandled rejection: ${error}`);
  });
};
