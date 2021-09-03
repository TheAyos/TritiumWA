const { Schema, model } = require("mongoose");

const defaultLimit = require("../config.json").dailyQuota;

/* works without these flags -> _id override , required: true, unique: true <-- this bugs with _id*/
const LimitSchema = new Schema({
  _id: { type: String },
  limit: { type: Number, default: defaultLimit },
  lastUpdated: { type: Number, default: Date.now() },
});

const LimitModel = model("Limits", LimitSchema);
module.exports = LimitModel;
