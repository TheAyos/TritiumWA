const { readdirSync } = require("fs");

module.exports = function (client) {
  const eventFiles = readdirSync(client.fromRootPath("events")).filter((file) => file.endsWith(".js"));
  console.log(`\n┌ Found total ${eventFiles.length} event(s).`);

  for (const eventFile of eventFiles) {
    console.log(`│ ✨ Loading event from file ${eventFile}..`);
    try {
      let event = require(client.fromRootPath("events", eventFile));
      let eventName = eventFile.split(".").shift();
      // pass the client
      client[eventName](event.bind(this, client));
      //client[eventName](event);
    } catch (error) {
      console.error(`Failed to register event from file ${eventFile}: ${error}`);
    }
  }
  console.log(`└ ☄️`);
};
