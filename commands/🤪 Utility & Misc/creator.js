const TritiumCommand = require("../../models/TritiumCommand");
module.exports = new TritiumCommand(
  async function ({ Tritium, msg }) {
    await Tritium.sendContact(msg.from, Tritium.config.youb_id);
  },
  {
    triggers: ["creator", "author", "owner", "developer"],
    description: "Send youbyoub's (my papa !) contact info.",
    groupOnly: true,
  },
);
