const mongoose = require("mongoose");
const groups = require("../models/Groups.js");

const defaultPrefix = ".";

class Settings {
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
   * Fetches a group from the database.
   * @param {string} [groupId] - Group id.
   * @returns {object} - Returns the fetched group object from database if it exists.
   */
  static async getGroup(groupId) {
    const group = await groups.findOne({
      groupID: groupId,
    });
    return group;
  }

  /**
   * Sets the prefix to use in a group
   * @param {string} [groupId] - Group id to use the prefix in.
   * @param {string} [prefix] - New prefix.
   * @returns {object} - Returns the new group object from the database.
   */
  static async setPrefix(groupId, prefix) {
    if (!groupId) throw new TypeError("No group id provided.");
    if (!prefix) throw new TypeError("No prefix specified");

    const group = await this.getGroup(groupId);

    if (!group) {
      const newGroup = new groups({ groupID: groupId, prefix: prefix });
      await newGroup.save().catch((e) => console.log(e));
      return newGroup;
    }

    group.prefix = prefix;

    await group.save().catch((e) => console.log(e));
    return group;
  }

  /**
   * Gets group prefix.
   * @param {string} [groupId] - Group id to fetch the prefix for.
   * @returns {string} - Returns the group's prefix.
   */
  static async getPrefix(groupId) {
    if (!groupId) throw new TypeError("No group id provided.");
    const group = await this.getGroup(groupId);
    if (!group || !group.prefix) {
      const newGroup = new groups({ groupID: groupId, prefix: defaultPrefix });
      await newGroup.save().catch((e) => console.log(e));
      return newGroup.prefix;
    }
    return group.prefix;
  }

  /**
   * Sets the nsfw activation in a group
   * @param {string} [groupId] - Group id to change the setting in.
   * @param {boolean} [nsfw] - Whether allow nsfw or not.
   * @returns {object} - Returns the new group object from the database.
   */
  static async setNsfw(groupId, nsfw) {
    if (!groupId) throw new TypeError("No group id provided.");
    if (typeof nsfw !== "boolean") throw new TypeError("Incorrect nsfw arg provided.");

    const group = await groups
      .findOneAndUpdate(
        { groupID: groupId },
        { groupID: groupId, nsfw: nsfw },
        { upsert: true, returnNewDocument: true, setDefaultsOnInsert: true },
      )
      .catch((e) => console.log(e));

    await group.save().catch((e) => console.log(e));
    return group;
  }

  /**
   * Gets nsfw state.
   * @param {string} [groupId] - Group id to fetch the nsfw setting for.
   * @returns {boolean} - Returns whether nsfw is allowed in this group or not.
   */
  static async getNsfw(groupId) {
    if (!groupId) throw new TypeError("No group id provided.");

    const group = await groups
      .findOneAndUpdate(
        { groupID: groupId },
        { groupID: groupId },
        { upsert: true, returnNewDocument: true, setDefaultsOnInsert: true },
      )
      .catch((e) => console.log(e));

    return group.nsfw;
  }

  /**
   * Sets the welcome message in a group
   * @param {string} [groupId] - Group id to change the setting in.
   * @param {boolean} [welcome] - Whether greet new people or not.
   * @returns {object} - Returns the new group object from the database.
   */
  static async setWelcome(groupId, welcome, welcomeMsg) {
    if (!groupId) throw new TypeError("No group id provided.");
    if (typeof welcome !== "boolean") throw new TypeError("Incorrect welcome arg provided.");

    const group = await groups
      .findOneAndUpdate(
        { groupID: groupId },
        { groupID: groupId, welcome: welcome },
        { upsert: true, returnNewDocument: true, setDefaultsOnInsert: true },
      )
      .catch((e) => console.log(e));

    await group.save().catch((e) => console.log(e));
    return group;
  }

  /**
   * Gets nsfw state.
   * @param {string} [groupId] - Group id to fetch the nsfw setting for.
   * @returns {boolean} - Returns whether nsfw is allowed in this group or not.
   */
  static async getWelcome(groupId) {
    if (!groupId) throw new TypeError("No group id provided.");

    const group = await groups
      .findOneAndUpdate(
        { groupID: groupId },
        { groupID: groupId },
        { upsert: true, returnNewDocument: true, setDefaultsOnInsert: true },
      )
      .catch((e) => console.log(e));

    console.log(group);
    return group.welcome;
  }
}

module.exports = Settings;
