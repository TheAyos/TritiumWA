const { Schema, model } = require("mongoose");

const defaults = require("../config.json");

const GroupSchema = new Schema({
  groupID: { type: String, required: true },
  prefix: { type: String, default: defaults.prefix },
  welcome: { type: Schema.Types.Mixed, default: { enabled: true, text: defaults.welcome_msg } },
  nsfw: { type: Boolean, default: false },
});

GroupSchema.index({ groupID: 1 }, { name: "groupID_index", unique: true });

const GroupModel = model("Groups", GroupSchema);
module.exports = GroupModel;
