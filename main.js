const moment = require("moment");
const { default: PQueue } = require("p-queue");
const queue = new PQueue({ concurrency: 5, autoStart: true, timeout: 60 * 1000 });

class Tritium {
  constructor() {
    this.log = require("./utils/logger");
    this.config = require("./config.json");
    this.db = require("./utils/TastyMango");
    this.commands = [];
    this.cooldowns = new Map();
    this.queue = queue;

    this.stats = { commands: { ran: 0, loaded: 0, disabled: 0 } };
    this.DEV = true;
    this.MSG_TIME = [];

    Object.assign(this, require("./utils/misc"));
  }

  load() {
    this.db.connect(this.config.mongo_db_path);
    require("./handlers/CommandLoader")(this);
    this.stats.commands.loaded = this.commands.length;
  }

  launch(client) {
    this.client = client;
    require("./handlers/EventLoader")(Object.assign(this.client, this), true);
    // this.cleanupPrepareTerrain();
    this.ready();
  }

  /*async cleanupPrepareTerrain() {
    const unreadMessagesSet = new Set();
    for (let i = 0; i < 1; i++) {
      await this.client
        .getAllUnreadMessages()
        .then((messageArray) => messageArray.map((unreadMessage) => unreadMessagesSet.add(unreadMessage)));
    }

    unreadMessagesSet.forEach((unreadMessage) =>
      queue.add(
        () =>
          this.client
            .deleteMessage(unreadMessage.chat.id, unreadMessage.id, true)
            .then(console.log("deleted", unreadMessage.id, unreadMessage.timestamp))
            .catch(),
        { priority: -6 },
      ),
    );
  }*/

  ready() {
    this.client.sendText(this.config.youb_id, `Started 🌌 Tritium at ${moment().format("HH:mm")}`);
    const a = "💥TRITIUM Started 🔥⚡";
    console.log(this.cColor(a, "lightgreen"), this.cColor(a, "red"), this.cColor(a, "grey"), this.cColor(a, "beige"));
    console.log(this.cColor(this.commands.length, "lightgreen"), "commands loaded\n");
  }

  /*exportCmds() {
    const exportCmds = this.commands.map(function (cmd) {
      return { t: cmd.props.triggers, d: cmd.props.description, u: cmd.props.usage, c: cmd.props.cooldown };
    });
    // require("fs").writeFile("./commands.json", JSON.stringify(exportCmds), {}, () => console.log("Exported commands.json"));
    return JSON.stringify(exportCmds);
  }*/
}

module.exports.queue = queue;
module.exports.Tritium = Tritium;
