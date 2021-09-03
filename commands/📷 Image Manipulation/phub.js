const TritiumCommand = require("../../models/TritiumCommand");

const fetch = require("node-fetch");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, args, cleanArgs }) {
    let pp = "";
    let hub = "";
    if (args.length === 1) pp = args[0];
    else if (args.length > 1) {
      cleanArgs = cleanArgs.indexOf("|") > -1 ? cleanArgs.split("|") : args;
      pp = cleanArgs.shift().trim();
      hub = cleanArgs.shift().trim();
    }

    const loveThat = await fetch(
      `https://youbyoub.herokuapp.com/api/v1/phub` +
      //`http://192.168.1.21:5000/api/v1/phub` +
        `?text1=${encodeURIComponent(pp)}` +
        `&text2=${encodeURIComponent(hub)}`,
    );

    const buff = await loveThat.buffer();
    await Tritium.sendFile(
      msg.from,
      `data:image/png;base64,${buff.toString("base64")}`,
      "phub.png",
      "",
      msg.id,
    );
  },
  {
    triggers: ["phub", "ph"],
    usage: ["{command} [1st text] [2nd text]"],
    example: ["{command} Nrop hub..."],
    description: "Generates a Pornhub logo from given text !",

    cooldown: 7,
    minArgs: 2,
    groupOnly: true,
  },
);
