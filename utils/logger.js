function logger(message, name = "log") {
  const date = Date().toString().split(" ").slice(1, 5).join(" ");
  message = message instanceof Object ? require("util").inspect(message) : message;
  console.log({ name, msg: `[${date}] ${message}` });
}
module.exports = logger;
