const moment = require("moment");
const { resolve, join } = require("path");

module.exports = {
  rootPath: resolve(),
  fromRootPath: function (...pathS) {
    return join(this.rootPath, ...pathS);
  },

  WMStrm: require("./WMStrm"),
  jikan: "https://api.jikan.moe/v3/",
  processTime: (timestamp, now) => moment.duration(now - moment(timestamp * 1000)).asSeconds(),

  getCommand: function (args) {
    return typeof args === "string"
      ? this.commands.find((c) => c.props.triggers.includes(args))
      : args.props
      ? this.commands.find((c) => c.props.triggers.includes(args.name))
      : undefined;
  },

  helpThisPoorMan: function (msg, cmd) {
    const client = this;
    this.getCommand("help").run({
      client,
      msg,
      args:
        typeof cmd === "string" ? client.getCommand(cmd).triggers[0] : cmd.triggers ? cmd.triggers[0] : "",
    });
  },

  ccolor: (t, c) => {
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
  },
};

Map.prototype.find = function find(propOrFn) {
  if (!propOrFn || typeof propOrFn !== "function") throw new Error("Error in args");
  const func = propOrFn;
  for (const [key, val] of this) if (func(val, key, this)) return val;
  return null;
};

/**
 * @returns {String} Returns a string with the number in its ordinal form
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

/* process.on("uncaughtException", (error) => {
  const cleanErrorMsg = error.stack.replace(new RegExp(`${this.rootPath}/`, "g"), "./");
  require("./logger")(`Uncaught Exception: ${cleanErrorMsg}`, "error");
  // process.exit(1);
});*/

process.on("unhandledRejection", (reason) => {
  throw reason;
});
