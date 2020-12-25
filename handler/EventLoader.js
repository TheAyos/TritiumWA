const { readdirSync } = require("fs");
const { join } = require("path");
const rootPath = require("path").resolve();

module.exports = function (client) {
    const eventFiles = readdirSync(join(rootPath, "events"));
    console.log(`\nFound total ${eventFiles.length} event(s).`);

    for (const eventFile of eventFiles) {
        if (!eventFile.endsWith(".js")) return;
        console.log(`✨  Loading event from file ${eventFile}..`);
        try {
            let event = require(join(rootPath, "events", eventFile));
            let eventName = eventFile.split(".")[0];
            client[eventName](event);
        } catch (err) {
            console.error(`Failed to register event from file ${eventFile}: ${err}`);
        }
    }
};
