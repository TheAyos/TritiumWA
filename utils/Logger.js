const { resolve } = require("path");

function logger(message, name = "info") {
    const date = Date().toString().split(" ").slice(1, 5).join(" ");
    message = message instanceof Object ? require("util").inspect(message) : message;
    message = message.replace(new RegExp(resolve(), "gi"), ".");
    const color = name === "info" ? "\x1b[1m\x1b[32m" : name === "error" ? "\x1b[31m" : "";
    console.log(`\n\x1b[33m[${date}] ${color}\x1b[1m${name} > \x1b[0m${message}\n`);
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