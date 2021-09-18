const commands = require("fs")
    .readdirSync(__dirname)
    .filter((f) => f !== "index.js" && f.endsWith(".js"))
    .map((f) => require(`${__dirname}/${f}`));

module.exports = {
    commands,
    name: "🧮 Maths",
};
