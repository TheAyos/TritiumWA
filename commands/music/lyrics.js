const TritiumCommand = require('../../models/TritiumCommand');

const TEXT_ERROR_UNABLE_TO_FIND_LYRICS = `Unable to find that music, Try another one !`;

// const Lyrics = require("../../utils/youbLyrics"); // const Lyrics = require("../../utils/Frilycs");
// const Lyrics = require("../../utils/genius-lyrics-api/index");
const Lyrics = require('genius-lyrics-api');

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, args, cleanArgs }) {
        if (args.length > 3) return await msg.reply("*Max query allowed is 3 words, I recommend that you put the name of the artist next to the song's title.*", true);
        // let lyrics = await Lyrics(cleanArgs);
        const lyrics = await Lyrics.getLyrics({ apiKey: Tritium.config.GENIUS_API_KEY, title: cleanArgs, artist: '', optimizeQuery: true });
        if (!lyrics) return Tritium.reply(msg.from, TEXT_ERROR_UNABLE_TO_FIND_LYRICS, msg.id);
        // let caption = `*${lyrics.artist}* - *${lyrics.song}*\n🎵 ${lyrics.lyrics}`;
        return await msg.reply(lyrics, true);
    },
    {
        triggers: ['lyrics', 'ly'],
        description: '🎼 Get music lyrics. 🎶',

        minArgs: 1,
        cooldown: 20,
        missingArgs: 'What song do you want the lyrics of ?',
        groupOnly: true,
    },
);
