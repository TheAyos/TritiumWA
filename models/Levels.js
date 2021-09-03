const { Schema, model } = require("mongoose");

const LevelSchema = new Schema({
  userID: { type: String, required: true },
  groupID: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  lastUpdated: { type: Number, default: Date.now() },
});

LevelSchema.index({ userID: 1, groupID: 1 }, { name: "userID_groupID_index", unique: true });

const LevelModel = model("Levels", LevelSchema);
module.exports = LevelModel;
