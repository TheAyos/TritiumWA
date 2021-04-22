const { create } = require("@open-wa/wa-automate");
const generateOptions = require("./utils/launchOptionsGen");
const { Tritium } = require("./main");

const tritium = new Tritium();
tritium.load();
console.log(tritium.exportCmds());

// process.exit(666);

create(generateOptions(true, () => console.log("Just crashed, yes.")))
  .then((client) => tritium.launch(client))
  .catch((error) => console.log(error));
