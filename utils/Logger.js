const { resolve } = require("path");

// TODO centralize colors in one file (probably misc.js)

const COLOR_RESET = "\x1b[0m";
const COLOR_BOLD = "\x1b[1m";
const COLOR_RED = "\x1b[31m";
const COLOR_GREEN = "\x1b[32m";
const COLOR_YELLOW = "\x1b[33m";

function logger(message, name = "info") {
    const date = Date().toString().split(" ").slice(1, 5).join(" ");
    message = message instanceof Object ? require("util").inspect(message) : message;
    message = message.replace(new RegExp(resolve(), "gi"), ".");
    const color = name === "info" ? COLOR_GREEN : name === "error" ? COLOR_RED : COLOR_GREEN;
    console.log(`${COLOR_YELLOW}[${date}] ${color}${COLOR_BOLD}${name} > ${COLOR_RESET}${message}`);
}
module.exports = logger;

// for windows :
// message = message.replace(new RegExp(resolve().replace(/\\/g, "\\\\"), "gi"), ".");
// json-like for file output
// console.log({ name, msg: `[${date}] ${message}` });

/* let logFile = fs.createWriteStream(__dirname + '/logs/error.log', {flags: 'a'});
process.on('uncaughtException', (err, next) => {
  var date = new Date()
  console.error(`+++++++ ${date} error found, logging event +++++++`)
  console.error(err.stack)
  logFile.write(`${date}.${err.stack}`)
  return
})*/