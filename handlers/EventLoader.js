const { readdirSync } = require("fs");

module.exports = function (client) {
    const eventFiles = readdirSync(client.fromRootPath("events"));
    console.log(`\n┌ Found total ${eventFiles.length} event(s).`);

    for (const eventFile of eventFiles) {
        if (!eventFile.endsWith(".js")) return;
        console.log(`│ ✨ Loading event from file ${eventFile}..`);
        try {
            let event = require(client.fromRootPath("events", eventFile));
            let eventName = eventFile.split(".").shift();
            // pass the client
            client[eventName](event.bind(this, client));
            //client[eventName](event);
        } catch (err) {
            console.error(`Failed to register event from file ${eventFile}: ${err}`);
        }
    }
    console.log(`└ ☄️`);
};
