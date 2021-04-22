const moment = require("moment");
const { default: PQueue } = require("p-queue");
const queue = new PQueue({ concurrency: 5, autoStart: false, timeout: 60 * 1000 });

class Tritium {
  constructor() {
    this.log = require("./utils/logger");
    this.config = require("./config.json");
    this.db = require("./utils/TastyMango");
    this.commands = [];
    this.cooldowns = new Map();

    this.stats = {
      commands: {
        ran: 0,
        loaded: 0,
        disabled: 0,
      },
    };
    this.DEV = true;
    this.MSG_TIME = [];

    Object.assign(this, require("./utils/misc"));
  }

  load() {
    this.db.connect(this.config.mongo_db_path);
    require("./handlers/CommandLoader")(this);
    // is it useful ?
    this.stats.commands.loaded = this.commands.length;
    // require("./handlers/EventLoader")(this);
  }

  exportCmds() {
    const exportCmds = this.commands.map(function (cmd) {
      return { t: cmd.props.triggers, d: cmd.props.description, u: cmd.props.usage, c: cmd.props.cooldown };
    });
    // require("fs").writeFile("./commands.json", JSON.stringify(exportCmds), {}, () => console.log("Exported commands.json"));
    return JSON.stringify(exportCmds);
  }

  async launch(client) {
    this.client = client;

    // *** Cleanup old messages on boot ***
    const unreadMessagesSet = new Set();
    for (let i = 0; i < 5; i++) {
      await client
        .getAllUnreadMessages()
        .then((messageArray) => messageArray.map((unreadMessage) => unreadMessagesSet.add(unreadMessage)));
    }

    await unreadMessagesSet.forEach((unreadMessage) =>
      queue.add(
        () =>
          client
            .deleteMessage(unreadMessage.chat.id, unreadMessage.id, true)
            .then(console.log("deleted", unreadMessage.id, unreadMessage.timestamp))
            .catch(),
        { priority: -6 },
      ),
    );

    client["onStateChanged"](require("./events/onStateChanged").bind(this, client));

    const filePath = "./events/onAnyMessage.js";
    const { watch } = require("fs");
    const watcher = watch(filePath);

    let proc = async (message) => {
      require(filePath)(Object.assign(this.client, this), message);
      return true;
    };
    client.onMessage((message) => queue.add(() => proc(message), { priority: 1 }));
    queue.start();
    // *** Ma hot-reload 😎 ***
    watcher.on("change", () => {
      try {
        console.log(this.ccolor("CHANGE DETECTED ! -", "lightred"), filePath);
        delete require.cache[require.resolve(filePath)];

        proc = async (message) => {
          await require(filePath)(Object.assign(this.client, this), message);
          return true;
        };
      } catch (error) {
        console.log(error);
      }
    });

    this.ready();
  }

  ready() {
    this.client.sendText(this.config.youb_id, `Started 🌌 Tritium at ${moment().format("HH:mm")}`);
    const a = "💥TRITIUM Started 🔥⚡";
    console.log(this.ccolor(a, "lightgreen"), this.ccolor(a, "red"), this.ccolor(a, "grey"), this.ccolor(a, "beige"));
    console.log(this.ccolor(this.commands.length, "lightgreen"), "commands loaded\n");
  }
}

module.exports.queue = queue;
module.exports.Tritium = Tritium;
