const { getSignature } = require("../utils/misc");

module.exports = class TritiumCommand {
    /**
     * @name TritiumCommand
     * @kind constructor
     *
     * @param {Function} _run - The callback function that gets called when the command is used.
     *
     * @param {Object} props Command properties
     * @param {String[]} props.triggers A list of triggers of the command.
     * @param {String|String[]} [props.description] A description of the command
     * @param {String|String[]} [props.usage] The command usage format ?- will be automatically generated if not specified
     * @param {String} [props.notice] Added details about the command.
     * @param {String|String[]} [props.example] Usage example(s) of the command.
     * @param {Boolean|false} [props.groupOnly] Whether or not the command is usable only in a group.
     * @param {Boolean|false} [props.ownerOnly] Whether or not the command is usable only by an owner.
     * @param {String|String[]|""} [props.clientPerms] Required client permissions to run the command.
     * @param {String|String[]|""} [props.userPerms] Required user permissions to use the command.
     * @param {Boolean|false} [props.isNSFW] Whether or not the command is usable only in NSFW groups.
     * @param {Number|3} [props.cooldown] Duration (in seconds) for throttling usages of the command.
     * @param {Number|String|0} [props.minArgs] How many or what type of arguments are needed for the command. Either a number or "quotedMsg" if the command needs a quoted message.
     * @param {String|""} [props.missingArgs] Custom message to reply instead of default help message if (and only if) NO ARGUMENTS are given.
     * @param {Boolean|false} [props.hidden] Whether or not the command should be hidden from the help command
     */
    constructor(_run, props) {
        this.callback = _run;
        this.props = Object.assign(
            {
                triggers: [""],
                description: "",
                usage: "{command}",
                notice: "",
                example: "",
                groupOnly: false,
                ownerOnly: false,
                clientPerms: "",
                userPerms: "",
                isNSFW: false,
                cooldown: 3,
                minArgs: 0,
                missingArgs: "",
                hidden: false,
            },
            props,
        );

        this.name = this.props.triggers[0];
        this.props.usage = typeof this.props.usage === "string" ? [this.props.usage] : this.props.usage;
        this.props.example = typeof this.props.example === "string" ? [this.props.example] : this.props.example;
        this.props.clientPerms = typeof this.props.clientPerms === "string" ? [this.props.clientPerms] : this.props.clientPerms;
        this.props.userPerms = typeof this.props.userPerms === "string" ? [this.props.userPerms] : this.props.userPerms;
    }

    async run({ Tritium, msg, args, cleanArgs, chatPrefix, usedAlias, updateCooldowns }) {
        // TODO: cooldowns baby ;)

        // *** Owner only checks***
        if (this.props.ownerOnly && msg.sender.id !== Tritium.config.youb_id) {
            return Tritium.reply(msg.from, "*🤏 Owner only can use this command !*", msg.id);
        }

        // *** Group only checks ***
        if (this.props.groupOnly && !msg.isGroupMsg) return Tritium.reply(msg.from, `😿 Sorry ${msg.sender.pushname}, this command is only available in groups !`, msg.id, true);

        // *** User permissions checks ***
        const isAdmin = msg.isGroupMsg ? msg.chat.groupMetadata.participants.find((u) => u.id === msg.sender.id && u.isAdmin) || msg.sender.id === Tritium.config.youb_id : undefined;
        if (this.props.userPerms && this.props.userPerms.includes("ADMINISTRATOR") && !isAdmin)
            return Tritium.reply(msg.from, `Sorry ${msg.sender.pushname}, you need to be administrator to do this.`, msg.id, true);

        // *** Arguments checks *** => Types: number of args, 'quotedMsg', ..., + missingArgs reply handling
        if (this.props.minArgs && typeof this.props.minArgs === "string") {
            if (this.props.minArgs === "quotedMsg" && !msg.quotedMsg) return await Tritium.reply(msg.from, "*💭 You need to quote a message !*", msg.id);
            // if (this.props.minArgs === "quotedImg" && !msg....) return await Tritium.reply(msg.from, "*💭 You need to quote a picc !*", msg.id); // TODO
        } else if (this.props.minArgs && args.length < this.props.minArgs) {
            return Tritium.reply(msg.from, this.props.missingArgs ? this.props.missingArgs : this.getHelpMsg(chatPrefix), msg.id, true);
        }

        // *** Cooldown updating and checking (last step before execution in case user fails argument checks so he doesn't get a cooldown) ***
        if (await updateCooldowns(this)) return;

        // *** Fancy stuff ***
        Tritium.simulateTyping(msg.from, true);

        // *** Command execution & error handling ***
        try {
            await this.callback({ Tritium, msg, args, cleanArgs, chatPrefix, usedAlias }).catch((e) => Tritium.error(e));
        } catch (error) {
            await Tritium.simulateTyping(msg.from, false);
            await Tritium.reply(msg.from, `An error occurred: \`${error.message}\`. Try again later!`, msg.id);
            Tritium.error(error);
        }
        await Tritium.simulateTyping(msg.from, false);
    }

    getHelpMsg(prefix) {
        const usage = this.props.usage ? this.props.usage.join("\n").trim() : "";
        const example = this.props.example ? this.props.example.join("\n").trim() : "";

        const aliasHelp = this.props.triggers.filter((a) => a != this.props.triggers[0]);

        let helpMessage = `*Help | ${this.name}*\n\n` + `*Description:* ${this.props.description}\n` + `*Remind:* *[ ]* means an argument is required and *<>* means it is optional.\n`;
        helpMessage += this.props.notice ? `*Notice: _${this.props.notice}_*\n` : "";
        helpMessage += usage ? `\n*Usage*\n\`\`\`${usage}\`\`\`` : "";
        helpMessage += example ? `\n` + `*Example*\n\`\`\`${example}\`\`\`` : "";
        helpMessage += aliasHelp.length ? `\n*Aliases*\n\`\`\`${aliasHelp.join(", ")}\`\`\`` : "";

        helpMessage += getSignature();
        helpMessage = helpMessage.replace(/{command}/g, prefix + this.name).replace(/{prefix}/g, prefix);
        return helpMessage;
    }
};
