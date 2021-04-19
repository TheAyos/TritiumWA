const mongoose = require("mongoose");

class TastyMango {
  /**
   * Connects to the mongo database. (use only once)
   * @param {string} [mongoURI] - MongoDB URI to connect to
   */
  static async connect(mongoURI) {
    if (!mongoURI) throw new TypeError("MongoDB URI not provided.");
    return mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
      autoIndex: true,
    });
  }
}

module.exports = TastyMango;
module.exports.Experience = require("./MangoFunctions/Experience");
module.exports.Limit = require("./MangoFunctions/Limit");
module.exports.Settings = require("./MangoFunctions/Settings");
