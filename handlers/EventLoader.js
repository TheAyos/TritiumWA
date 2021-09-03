const { readdirSync } = require("fs");
const { watch } = require("fs");
const { cColor: cc } = require("../utils/misc");

module.exports = function (client, useHotReload = false) {
  const eventFiles = readdirSync(client.fromRootPath("events")).filter((file) => file.endsWith(".js"));
  console.log(`\n┌ Found total ${eventFiles.length} event(s).`);

  for (const eventFile of eventFiles) {
    console.log(`│ ✨ Loading event from file ${eventFile}..`);
    try {
      const eventName = eventFile.split(".").shift();
      // const event = require(client.fromRootPath("events", eventFile));
      // client[eventName](event.bind(null, client));

      if (useHotReload) {
        const eventPath = client.fromRootPath("events", eventFile);
        const watcher = watch(eventPath);

        let freshPull = (arg) => client.queue.add(() => require(eventPath)(client, arg), { priority: 1 });
        client[eventName]((arg) => freshPull(arg));

        watcher.on("change", () => {
          try {
            console.log(cc("CHANGE DETECTED ! -", "lightred"), eventPath);
            delete require.cache[require.resolve(eventPath)];
            freshPull = (arg) => client.queue.add(() => require(eventPath)(client, arg), { priority: 1 });
          } catch (error) {
            console.log(error);
          }
        });
      } else {
        const event = require(client.fromRootPath("events", eventFile));
        client[eventName](event.bind(null, client));
      }
    } catch (error) {
      console.log(`⌚ Failed to register event from file ${eventFile}: ${error}`);
      throw new Error(`⌚ Failed to register event from file ${eventFile}: ${error}`);
    }
  }
  console.log(`└ ☄️\n`);
};

/*
const { readdirSync } = require("fs");
const { watch } = require("fs");
const { cColor: cc } = require("../utils/misc");

const { default: PQueue } = require("p-queue");
const queue = new PQueue({ concurrency: 5, autoStart: false, timeout: 60 * 1000 });

module.exports = function (client) {
  const eventFiles = readdirSync(client.fromRootPath("events")).filter((file) => file.endsWith(".js"));
  console.log(`\n┌ Found total ${eventFiles.length} event(s).`);

  for (const eventFile of eventFiles) {
    console.log(`│ ✨ Loading event from file ${eventFile}..`);
    try {
      const event = require(client.fromRootPath("events", eventFile));
      const eventName = eventFile.split(".").shift();

      client[eventName](event.bind(null, client));

      /* const eventPath = client.fromRootPath("events", eventFile);
      let e = require(eventPath).bind(this, client);
      client[eventName](e);

      const watcher = watch(eventPath);
      watcher.on("change", () => {
        try {
          console.log(cc("CHANGE DETECTED ! -", "lightred"), eventPath);
          delete require.cache[require.resolve(eventPath)];
          client[eventName](() => true);
          e = require(eventPath).bind(this, client);
          client[eventName](e);
          // client[eventName](require(eventPath).bind(this, client));
        } catch (error) {
          console.log(error);
        }
      });
    } catch (error) {
      throw new Error(`⌚ Failed to register event from file ${eventFile}: ${error}`);
    }
  }
  console.log(`└ ☄️\n`);
};
*/
