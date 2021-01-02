const winston = require("winston");

module.exports = async (Tritium) => {
  Tritium.rootPath = require("path").resolve();
  Tritium.fromRootPath = (...pathS) => require("path").join(Tritium.rootPath, ...pathS);
  Tritium.getCommand = function (args) {
    return typeof args === "string"
      ? Tritium.commands.find((c) => c.props.triggers.includes(args))
      : args.props
      ? Tritium.commands.find((c) => c.props.triggers.includes(args.props.triggers[0]))
      : undefined;
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

  Tritium.logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.timestamp({ format: "MM/DD/YYYY HH:mm:ss" }),
      winston.format.printf((log) => `[${log.timestamp}] [${log.level.toUpperCase()}]: ${log.message}`),
    ),
  });

  Tritium.helpThisPoorMan = (msg, cmd) =>
    Tritium.getCommand("help").run({
      Tritium,
      msg,
      args: cmd ? Tritium.getCommand(cmd).triggers[0] : "",
    });

  process.on("uncaughtException", (error) => {
    const cleanErrorMsg = error.stack.replace(new RegExp(`${Tritium.rootPath}/`, "g"), "./");
    Tritium.logger.error(`Uncaught Exception: ${cleanErrorMsg}`);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    throw reason;
  });
};
