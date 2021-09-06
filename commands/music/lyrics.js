const TritiumCommand = require("../../models/TritiumCommand");

const TEXT_ERROR_UNABLE_TO_FIND_LYRICS = `Unable to find that music, Try another one !`;

// const Lyrics = require("../../utils/youbLyrics"); // const Lyrics = require("../../utils/Frilycs");
const Lyrics = require("../../utils/genius-lyrics-api/index");

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, cleanArgs }) {
        // let lyrics = await Lyrics(cleanArgs);
        const lyrics = await Lyrics.getLyrics({ apiKey: Tritium.config.GENIUS_API_KEY, title: cleanArgs, artist: "" });
        if (!lyrics) return Tritium.reply(msg.from, TEXT_ERROR_UNABLE_TO_FIND_LYRICS, msg.id);
        // let caption = `*${lyrics.artist}* - *${lyrics.song}*\n🎵 ${lyrics.lyrics}`;
        await Tritium.reply(msg.from, lyrics, msg.id);
        // await Tritium.reply(msg.from, caption, msg.id);
    },
    {
        triggers: ["lyrics", "ly"],
        description: "🎼 Get music lyrics. 🎶",

        minArgs: 1,
        cooldown: 20,
        missingArgs: "What song do you want the lyrics of ?",
        groupOnly: true,
    },
);
