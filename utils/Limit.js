const mongoose = require("mongoose");
const limits = require("../models/Limits.js");

const defaultLimit = 50;

class Limit {
  /**
   * Connects to the mongo database.
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

  /**
   * Fetches a user from the database.
   * @param {string} [userId] - User id.
   * @returns {object} - Returns the fetched user object from database if it exists.
   */
  //TODO: if user not existent, create here
  static async getUser(userId) {
    const user = await limits.findOne({
      _id: userId,
    });
    return user;
  }

  /**
   * Sets the limit of a user
   * @param {string} [userId] - User id.
   * @param {number} [limit] - New limit.
   * @returns {object} - Returns the new user object from the database.
   */
  static async setLimit(userId, limit) {
    const user = await this.getUser(userId);

    if (!user) {
      const newUser = new limits({ _id: userId, limit: limit });
      await newUser.save().catch((e) => console.log(e));
      return newUser;
    }

    user.limit = limit;
    user.lastUpdated = Date.now();

    await user.save().catch((e) => console.log(e));
    return user;
  }

  /**
   * Gets user limit.
   * @param {string} [userId] - User id to fetch the limit for.
   * @returns {string} - Returns the user's limit.
   */
  static async getLimit(userId) {
    if (!userId) throw new TypeError("No user id provided.");

    const user = await this.getUser(userId);

    if (!user) {
      const user = new limits({ _id: userId }); // default TODO: see that hmmm
      await user.save().catch((e) => console.log(e));
      return user.limit;
    }

    return user.limit;
  }

  static async getLastUpdated(userId) {
    if (!userId) throw new TypeError("No user id provided.");

    const user = await this.getUser(userId);

    if (!user) {
      const user = new limits({ _id: userId });
      await user.save().catch((e) => console.log(e));
      return user.lastUpdated;
    }

    return user.lastUpdated;
  }
}

module.exports = Limit;
