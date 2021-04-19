require("module-alias/register");

const { create } = require("@open-wa/wa-automate");
const Tritium = require("./main");

const tritium = new Tritium();

tritium.load();

// process.exit(666);

create(require("./utils/launch_options")(true, null))
  .then((client) => tritium.launch(client))
  .catch((error) => console.log(error));