const TritiumCommand = require("../../models/TritiumCommand");
const YT = require("../../utils/YT");

const MAX_LENGTH_SECONDS = 10 * 60;

const TEXT_ERROR_LINK_IS_PLAYLIST = `The given link is a playlist !`;
const TEXT_ERROR_VIDEO_LINK = `Video unavaliable. Invalid link ? Retryyy !`;
const TEXT_ERROR_LIVE_VIDEO = `Can't play a Live video !`;
const TEXT_ERROR_SENDING_INFO_CARD = `I wasn't able to send you this video's info card :(`;
const TEXT_ERROR_SENDING_AUDIO = `I wasn't able to send you the audio track :(`;
const TEXT_TOO_LONG = `*It's too long (>${MAX_LENGTH_SECONDS / 60} min) !*\n_don't worry that what she said..._`;

const DYNAMIC_TEXT_PLAYTHAT_UNABLE_TO_PARSE = (prx) => `Unable to parse quoted message !\nAre you sure it comes from the \`\`\`${prx}youtube\`\`\` command ?`;

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, chatPrefix }) {
        msg.QUOTEDMSG_PARSED_BODY = undefined; // TODO: remember that for other uses
        if (msg.quotedMsg) {
          msg.QUOTEDMSG_PARSED_BODY =
                msg.quotedMsg.type === "chat"
                    ? msg.quotedMsg.body
                    : msg.quotedMsg.type === "image" || msg.quotedMsg.type === "video"
                    ? msg.quotedMsg.caption
                    : undefined;
        } else {
          msg.QUOTEDMSG_PARSED_BODY =
                msg.quotedMsgObj.type === "chat"
                    ? msg.quotedMsgObj.body
                    : msg.quotedMsgObj.type === "image" || msg.quotedMsgObj.type === "video"
                    ? msg.quotedMsgObj.caption
                    : undefined;
        }


        const parsedUrl = msg.QUOTEDMSG_PARSED_BODY ? msg.QUOTEDMSG_PARSED_BODY.split("\n").shift() : undefined;
        console.log(parsedUrl);

        if (!parsedUrl || !YT.isYTVideoLink(parsedUrl)) return Tritium.reply(msg.from, DYNAMIC_TEXT_PLAYTHAT_UNABLE_TO_PARSE(chatPrefix), msg.id);

        if (YT.isYTPlaylistLink(parsedUrl)) return Tritium.reply(msg.from, TEXT_ERROR_LINK_IS_PLAYLIST, msg.id);
        const track = await YT.getTrackFromVideoLink(parsedUrl);
        if (!track) return Tritium.reply(msg.from, TEXT_ERROR_VIDEO_LINK, msg.id);
        if (track.isLiveContent) return Tritium.reply(msg.from, TEXT_ERROR_LIVE_VIDEO, msg.id);
        if (track.lengthSeconds > MAX_LENGTH_SECONDS) return Tritium.reply(msg.from, TEXT_TOO_LONG, msg.id);

        try {
            const caption = `➸ *${track.title}* by _*${track.channel.name}*_`;
            await Tritium.sendFileFromUrl(msg.from, track.thumbnail.url, "thumb.jpg", caption).catch((e) => {
                throw e;
            });
        } catch (error) {
            Tritium.error(error);
            return Tritium.reply(msg.from, TEXT_ERROR_SENDING_INFO_CARD, msg.id);
        }

        try {
            const data64Audio = await YT.getData64Track(track.url).catch((e) => {
                throw e;
            });
            await Tritium.sendPtt(msg.from, data64Audio).catch((e) => {
                throw e;
            });
        } catch (error) {
            Tritium.error(error);
            return Tritium.reply(msg.from, TEXT_ERROR_SENDING_AUDIO, msg.id);
        }
    },
    {
        triggers: ["playthat"],
        usage: ["{command} (with a quoted message from ```{prefix}youtube```)"],
        example: ["{command} (with a quoted message from ```{prefix}youtube```)"],
        description: "Play a music 🎶, to be used in conjunction with the ```{prefix}youtube``` command.",

        cooldown: 20,
        minArgs: "quotedMsg",
        groupOnly: true,
    },
);
