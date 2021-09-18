const commands = require("fs")
    .readdirSync(__dirname)
    .filter((f) => f !== "index.js")
    .map((f) => require(`${__dirname}/${f}`));

module.exports = {
    commands,
    name: "🎵 Music",
};
