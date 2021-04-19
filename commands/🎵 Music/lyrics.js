const TritiumCommand = require("../../models/TritiumCommand");

//const Lyrics = require("../../utils/youbLyrics");
//const Lyrics = require("../../utils/Frilycs");
const Lyrics = require("../../utils/genius-lyrics-api/index");

module.exports = new TritiumCommand(
  async function ({ Tritium, msg, cleanArgs }) {
    //let lyrics = await Lyrics(cleanArgs);
    let lyrics = await Lyrics.getLyrics({
      apiKey: "3kl-XxbwD5LkBYPdctlek24FMYSPsdSiBpt1v0Y_zLaHLkVsvG8jViLGYaNrfRoy",
      title: cleanArgs,
      artist: "",
    });
    if (!lyrics) return Tritium.reply(msg.from, "Unable to find that music, Try another one !", msg.id);
    //let caption = `*${lyrics.artist}* - *${lyrics.song}*\n🎵 ${lyrics.lyrics}`;
    await Tritium.reply(msg.from, /*caption*/ lyrics, msg.id);
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
