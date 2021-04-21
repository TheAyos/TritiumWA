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

  getSignature: () => `\n*🤖 Tritium • ${moment().format("HH:mm")}* `,

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
      args: typeof cmd === "string" ? client.getCommand(cmd).triggers[0] : cmd.triggers ? cmd.triggers[0] : "",
    });
  },

  getFullHelpMsg: function (chatPrefix) {
    const categories = {};
    let cmdCount = 0;

    this.commands.forEach((cmd) => {
      cmdCount++;
      let category = categories[cmd.category];
      if (!category) {
        category = categories[cmd.category] = [];
      }
      category.push(cmd.props.triggers[0]);
    });

    const catCount = Object.keys(categories).length;

    let commandNames = "";
    commandNames = Object.keys(categories)
      .map((catItems) => `\n*${catItems}*\n\`\`\`> ${categories[catItems].join(", ")}\`\`\``)
      .join("");

    let helpMessageFull =
      `*Bot Commands*\n\n` +
      `The prefix of the bot on this group is *${chatPrefix}*\n` +
      `*Example:* ${chatPrefix}help love\n` +
      `𝙍𝙚𝙢𝙞𝙣𝙙: 𝘋𝘰𝘯'𝘵 𝘶𝘴𝘦 [ ] 𝘰𝘳 <> 𝘪𝘯 𝘤𝘰𝘮𝘮𝘢𝘯𝘥𝘴.\n\n` +
      `*A total of ${cmdCount} commands in ${catCount} categories:*` +
      `${commandNames}\n\n`;

    helpMessageFull += `For more info use \`\`\`${chatPrefix}help <command>\`\`\``;
    helpMessageFull += this.getSignature();
    return helpMessageFull;
  },

  /**
   * Converts a number into an simplified format (that resembles youtube view count numbers)
   * @param {number} num - The number to format
   * @example viewFormatter(1705000000); // (One billion five million)
   * @returns {string} Formatted number (i.e. "1.7B")
   */
  viewFormatter: function (num = 0) {
    if (Math.abs(num) > 10e8 - 1) return (Math.sign(num) * (Math.abs(num) / 10e8).toFixed(1)).toLocaleString("en") + "B";
    else if (Math.abs(num) > 10e5 - 1)
      return (Math.sign(num) * (Math.abs(num) / 10e5).toFixed(1)).toLocaleString("en") + "M";
    else if (Math.abs(num) > 10e2 - 1)
      return (Math.sign(num) * (Math.abs(num) / 10e2).toFixed(1)).toLocaleString("en") + "K";
    else return Math.sign(num) * Math.abs(num);
  },

  /**
   * Converts a duration in seconds to a formatted string that is easier to read
   * @param {number} input - Duration in seconds
   * @example secondsToFormattedString(180+12);
   * @returns {string} Formatted duration (i.e. "03:12")
   */
  secondsToFormattedString: function (input) {
    let res = [];
    // const years = Math.floor(input / 31536000);
    // const days = Math.floor((input % 31536000) / 86400);
    const hours = Math.floor(((input % 31536000) % 86400) / 3600);
    const minutes = Math.floor((((input % 31536000) % 86400) % 3600) / 60);
    const seconds = (((input % 31536000) % 86400) % 3600) % 60;

    if (hours) res.push(hours);
    if (hours && !minutes) res.push(minutes);
    if (hours && !minutes && !seconds) res.push(seconds);

    if (minutes) res.push(minutes);
    if (minutes && !seconds) res.push(seconds);

    if (seconds) res.push(seconds);

    res = res.map((n) => (n < 9 ? "0" + n.toString() : n));
    return res.join(":");
    // return years + " years " +  days + " days " + hours + " hours " + minutes + " minutes " + seconds + " seconds";
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

String.prototype.limit = function (length) {
  return this.length > length ? this.substring(0, length) + "..." : this;
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
  console.log(reason);
  // throw reason;
});
