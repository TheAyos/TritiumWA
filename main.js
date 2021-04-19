const moment = require("moment");

const { default: PQueue } = require("p-queue");
const queue = new PQueue({ concurrency: 5, autoStart: false });

module.exports = class Tritium {
  constructor() {
    this.log = require("./utils/logger");
    this.config = require("./config.json");
    this.db = require("./utils/TastyMango");
    this.commands = [];
    this.cooldowns = new Map();

    this.ranCommands = 0;
    this.DEV = true;

    Object.assign(this, require("./utils/misc"));
  }

  load() {
    this.db.connect(this.config.mongo_db_path);

    require("./handlers/CommandLoader")(this);
    // require("./handlers/EventLoader")(this);

    console.log("\n", this.ccolor(this.commands.length, "lightgreen"), "commands loaded\n");
  }

  launch(client) {
    this.client = client;

    const fs = require("fs");
    const filePath = "./events/onAnyMessage.js";
    const watcher = fs.watch(filePath);

    let proc = async (message) => {
      require(filePath)(Object.assign(this.client, this), message);
      return true;
    };

    // Ma hot-reload 😎
    watcher.on("change", () => {
      try {
        console.log(this.ccolor("CHANGE DETECTED ! -", "lightred"), filePath);
        delete require.cache[require.resolve(filePath)];

        proc = async (message) => {
          require(filePath)(Object.assign(this.client, this), message);
          return true;
        };
      } catch (error) {
        console.log(error);
      }
    });

    client.onMessage((message) => queue.add(() => proc(message), { priority: 1 }));
    queue.start();

    // const unreadMessages = await client.getAllUnreadMessages();
    // unreadMessages.forEach(processMessage)

    this.client.sendText(this.config.youb_id, `Started 🌌 Tritium at ${moment().format("HH:mm")}`);

    process.on("SIGINT", () => {
      this.client.kill();
      fs.unwatchFile(filePath);
      console.log("\x1b[1m\x1b[33m\x1b[40mKilled by SIGINT, TRITIUM Stopped.");
      process.exit(1);
    });

    console.log(this.ccolor("💥TRITIUM Started 🔥⚡", "grey"));
    console.log(this.ccolor("💥TRITIUM Started 🔥⚡", "beige"));
    console.log(this.ccolor("💥TRITIUM Started 🔥⚡"));
    console.log(this.ccolor("💥TRITIUM Started 🔥⚡", "red"));
    console.log(this.ccolor("💥TRITIUM Started 🔥⚡", "lightgreen"));
  }
};
