const { resolve } = require("path");

// TODO: fix for linux (path replacement)
function logger(message, name = "log") {
  const date = Date().toString().split(" ").slice(1, 5).join(" ");
  message = message instanceof Object ? require("util").inspect(message) : message;
  message = message.replace(new RegExp(resolve().replace(/\\/g, "\\\\"), "gi"), ".");
  // console.log({ name, msg: `[${date}] ${message}` });
  console.log(`\n\x1b[33m[${date}] \x1b[1m${name} > \x1b[0m${message}\n`);
}
module.exports = logger;
