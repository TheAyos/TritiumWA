const mongoose = require("mongoose");
const levels = require("../models/Levels.js");

class Experience {
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

  /**
   * Fetches a user from the database.
   * @param {string} [userId] - User id.
   * @param {string} [groupId] - Group id.
   * @returns {object} - Returns the fetched user object from database if it exists.
   */
  static async getUser(userId, groupId) {
    const user = await levels.findOne({
      userID: userId,
      groupID: groupId,
    });
    return user;
  }

  /**
   * If not already existent, saves a new user to the database and returns it.
   * @param {string} [userId] - User id.
   * @param {string} [groupId] - Group id.
   * @returns {object} - Returns the created user object.
   */
  static async createUser(userId, groupId) {
    if (!userId) throw new TypeError("No user id provided.");
    if (!groupId) throw new TypeError("No group id provided.");

    const isUser = await this.getUser(userId, groupId);
    if (isUser) return false;

    const user = new levels({ userID: userId, groupID: groupId });

    try {
      await user.save();
    } catch (e) {
      console.log(e);
    }
    return user;
  }

  /**
   * @param {string} [userId] - User id.
   * @param {string} [groupId] - Group id.
   */

  static async deleteUser(userId, groupId) {
    if (!userId) throw new TypeError("No user id provided.");
    if (!groupId) throw new TypeError("No group id provided.");

    const user = await levels.findOne({ userID: userId, groupID: groupId });
    if (!user) return false;

    await levels
      .findOneAndDelete({ userID: userId, groupID: groupId })
      .catch((e) => console.log(`Failed to delete user: ${e}`));

    return user;
  }

  /**
   * Adds Xp to a user.
   * @param {string} [userId] - User id.
   * @param {string} [groupId] - Group id.
   * @param {number} [xp] - Amount of xp to add.
   * @param {number} [cooldown] - Cooldown to avoid gaining xp from spamming (in milliseconds)
   * @returns {boolean} - Returns true if user leveled up.
   */

  static async appendXp(userId, groupId, xp, cooldown = 0) {
    if (!userId) throw new TypeError("No user id provided.");
    if (!groupId) throw new TypeError("No group id provided.");
    if (xp !== 0 && !xp) throw new TypeError("An amount of xp was not provided.");

    const user = await levels.findOne({ userID: userId, groupID: groupId });

    if (!user) {
      const newUser = new levels({
        userID: userId,
        groupID: groupId,
        xp: xp,
        level: Math.floor(0.1 * Math.sqrt(xp)),
        lastUpdated: Date.now(),
      });
      await newUser.save().catch((e) => console.log(`Failed to save new user.`));
      return Math.floor(0.1 * Math.sqrt(xp)) > 0;
    }

    if (cooldown > 0) {
      const now = Date.now();
      const lastUpdated = user.lastUpdated;
      if (!(now - lastUpdated > cooldown)) return false;
    }

    // console.log("appendXP before update: ", user);
    user.xp += parseInt(xp, 10);
    user.level = Math.floor(0.1 * Math.sqrt(user.xp));
    user.lastUpdated = Date.now();
    // console.log("appendXP after update: ", user);
    await user.save().catch((e) => console.log(`Failed to append xp: ${e}`));
    return Math.floor(0.1 * Math.sqrt((user.xp -= xp))) < user.level;
  }

  /**
   * @param {string} [userId] - User id.
   * @param {string} [groupId] - Group id.
   * @param {number} [levels] - Amount of levels to append.
   */

  static async appendLevel(userId, groupId, levelss) {
    if (!userId) throw new TypeError("No user id provided.");
    if (!groupId) throw new TypeError("No group id provided.");
    if (!levelss) throw new TypeError("An amount of levels was not provided.");

    const user = await levels.findOne({ userID: userId, groupID: groupId });
    if (!user) return false;

    user.level += parseInt(levelss, 10);
    user.xp = user.level * user.level * 100;

    user.save().catch((e) => console.log(`Failed to append level: ${e}`));

    return user;
  }

  /**
   * @param {string} [userId] - User id.
   * @param {string} [groupId] - Group id.
   * @param {number} [xp] - Amount of xp to set.
   */

  static async setXp(userId, groupId, xp) {
    if (!userId) throw new TypeError("No user id provided.");
    if (!groupId) throw new TypeError("No group id provided.");
    if (xp !== 0 && !xp) throw new TypeError("An amount of xp was not provided.");

    const user = await levels.findOne({ userID: userId, groupID: groupId });
    if (!user) return false;

    user.xp = xp;
    user.level = Math.floor(0.1 * Math.sqrt(user.xp));

    user.save().catch((e) => console.log(`Failed to set xp: ${e}`));

    return user;
  }

  /**
   * @param {string} [userId] - User id.
   * @param {string} [groupId] - Group id.
   * @param {number} [level] - A level to set.
   */

  static async setLevel(userId, groupId, level) {
    if (!userId) throw new TypeError("No user id provided.");
    if (!groupId) throw new TypeError("No group id provided.");
    if (!level) throw new TypeError("A level was not provided.");

    const user = await levels.findOne({ userID: userId, groupID: groupId });
    if (!user) return false;

    user.level = level;
    user.xp = level * level * 100;

    user.save().catch((e) => console.log(`Failed to set level: ${e}`));

    return user;
  }

  /**
   * @param {string} [userId] - User id.
   * @param {string} [groupId] - Group id.
   */

  static async fetch(userId, groupId, fetchPosition = false) {
    if (!userId) throw new TypeError("No user id provided.");
    if (!groupId) throw new TypeError("No group id provided.");

    const user = await levels.findOne({
      userID: userId,
      groupID: groupId,
    });
    if (!user) return false;

    if (fetchPosition === true) {
      const leaderboard = await levels
        .find({
          groupID: groupId,
        })
        .sort([["xp", "descending"]])
        .exec();
      user.position = leaderboard.findIndex((i) => i.userID === userId) + 1;
    }

    return user;
  }

  /**
   * @param {string} [userId] - User id.
   * @param {string} [groupId] - Group id.
   * @param {number} [xp] - Amount of xp to subtract.
   */

  static async subtractXp(userId, groupId, xp) {
    if (!userId) throw new TypeError("No user id provided.");
    if (!groupId) throw new TypeError("No group id provided.");
    if (xp !== 0 && !xp) throw new TypeError("An amount of xp was not provided.");

    const user = await levels.findOne({ userID: userId, groupID: groupId });
    if (!user) return false;

    user.xp -= xp;
    user.level = Math.floor(0.1 * Math.sqrt(user.xp));

    user.save().catch((e) => console.log(`Failed to subtract xp: ${e}`));

    return user;
  }

  /**
   * @param {string} [userId] - User id.
   * @param {string} [groupId] - Group id.
   * @param {number} [levels] - Amount of levels to subtract.
   */

  static async subtractLevel(userId, groupId, levelss) {
    if (!userId) throw new TypeError("No user id provided.");
    if (!groupId) throw new TypeError("No group id provided.");
    if (!levelss) throw new TypeError("An amount of levels was not provided.");

    const user = await levels.findOne({ userID: userId, groupID: groupId });
    if (!user) return false;

    user.level -= levelss;
    user.xp = user.level * user.level * 100;

    user.save().catch((e) => console.log(`Failed to subtract levels: ${e}`));

    return user;
  }

  /**
   * @param {string} [groupId] - Group id.
   * @param {number} [limit] - Amount of maximum enteries to return.
   */

  static async fetchLeaderboard(groupId, limit) {
    if (!groupId) throw new TypeError("No group id provided.");
    // if (!limit) throw new TypeError("A limit was not provided.");

    const users = await levels
      .find({ groupID: groupId })
      .sort([["xp", "descending"]])
      .exec();

    if (limit) return users.slice(0, limit);
    return users;
  }

  /**
   * @param {string} [client] - Your Discord.CLient.
   * @param {array} [leaderboard] - The output from 'fetchLeaderboard' function.
   */

  static async computeLeaderboard(client, leaderboard, fetchUsers = false) {
    if (!client) throw new TypeError("A client was not provided.");
    if (!leaderboard) throw new TypeError("A leaderboard id was not provided.");

    if (leaderboard.length < 1) return [];

    const computedArray = [];

    if (fetchUsers) {
      for (const key of leaderboard) {
        const user = (await client.users.fetch(key.userID)) || { username: "Unknown", discriminator: "000" };
        computedArray.push({
          groupID: key.groupID,
          userID: key.userID,
          xp: key.xp,
          level: key.level,
          position: leaderboard.findIndex((i) => i.groupID === key.groupID && i.userID === key.userID) + 1,
          username: user.username,
          discriminator: user.discriminator,
        });
      }
    } else {
      leaderboard.map((key) =>
        computedArray.push({
          groupID: key.groupID,
          userID: key.userID,
          xp: key.xp,
          level: key.level,
          position: leaderboard.findIndex((i) => i.groupID === key.groupID && i.userID === key.userID) + 1,
          username: client.users.cache.get(key.userID)
            ? client.users.cache.get(key.userID).username
            : "Unknown",
          discriminator: client.users.cache.get(key.userID)
            ? client.users.cache.get(key.userID).discriminator
            : "0000",
        }),
      );
    }

    return computedArray;
  }

  /**
   * @param {number} [targetLevel] - Xp required to reach that level.
   */
  static xpFor(targetLevel) {
    if (isNaN(targetLevel) || isNaN(parseInt(targetLevel, 10)))
      throw new TypeError("Target level should be a valid number.");
    if (isNaN(targetLevel)) targetLevel = parseInt(targetLevel, 10);
    if (targetLevel < 1) throw new RangeError("Target level should be a positive number.");
    return targetLevel * targetLevel * 100;
  }
}

module.exports = Experience;
