/**
 * add userResolvable
 * &&& refactor plz
 */

module.exports = {
    triggers: ["love", "lovecount", "lc"],
    usage: "{command} [name] [name]",
    example: "{command} chaplin dicaprio",
    description: "Calculate the love percentage between two users.💞",

    isNSFW: false,
    needArgs: true,
    cooldown: 10,

    run: async function ({ Tritium, msg, args }) {
        const { readFileSync } = require("fs");
        let fname = args[0],
            sname = args[1];

        if (!args || args.length === 1) {
            Tritium.reply(msg.from, "Enter both names 🙄!", msg.id);
            return;
        } else if (args > 2) {
            Tritium.commands.get("help").run(Tritium, msg, this.name);
        }

        try {
            async function love(array) {
                var hold = [],
                    result,
                    newArray;
                var emoji = "",
                    advice = "",
                    reactionGif = "";
                if (array.length > 2) {
                    newArray = array.map(function (item, index, array) {
                        return item + array[index + 1];
                    });
                    newArray.forEach(function (item) {
                        if (typeof item === "number" && !isNaN(item)) {
                            if (item < 10) {
                                hold.push(item);
                            } else if (item > 9) {
                                console.log(
                                    "Splitting" +
                                        item +
                                        " into " +
                                        item.toString()[0] +
                                        " and " +
                                        item.toString()[1],
                                );
                                hold.push(parseInt(item.toString()[0]));
                                hold.push(parseInt(item.toString()[1]));
                            }
                        }
                    });
                    love(hold);
                } else {
                    result = parseInt(array[0] + "" + array[1]);

                    if (result === 0) (emoji = "💔") && (advice = "No relationship is possible.");
                    if (result < 25) {
                        emoji = "💔";
                        advice = "It's low, but don't give up.";
                        reactionGif = await readFileSync(
                            `./assets/love/crying${Math.floor(Math.random() * 4) + 1}.gif`,
                            { encoding: "base64" },
                        );
                    } else if (result < 50) {
                        emoji = "❤️";
                        advice = "It's below average, you have to find someone else.";
                        reactionGif = await readFileSync(
                            `./assets/love/nope${Math.floor(Math.random() * 5) + 1}.gif`,
                            { encoding: "base64" },
                        );
                    } else if (result < 75) {
                        emoji = "💗";
                        advice = "It's a great score!";
                        reactionGif = await readFileSync(
                            `./assets/love/neutral${Math.floor(Math.random() * 4) + 1}.gif`,
                            { encoding: "base64" },
                        );
                    } else if (result <= 100) {
                        emoji = "💞";
                        advice = "A relationship is possible !";
                        reactionGif = await readFileSync(
                            `./assets/love/happy${Math.floor(Math.random() * 5) + 1}.gif`,
                            { encoding: "base64" },
                        );
                    }
                }
                //await Tritium.sendImageAsSticker(msg.from, `data:image/gif;base64,${reactionGif.toString('base64')}`);
                //await Tritium.sendVideoAsGif(msg.from, `data:video/mp4;base64,${reactionGif.toString('base64')}`, 'Result.mp4', `*${fname}* _*+*_ *${sname}* = ${result}% ${emoji}\n${advice}`, msg.id);
                await Tritium.sendImageAsSticker(msg.from, `data:image/gif;base64,${reactionGif}`);
                Tritium.sendText(
                    msg.from,
                    `*${fname}* _*+*_ *${sname}* = ${result}% ${emoji}\n${advice}`,
                );
                result = array[0] + "" + array[1] + "%";
                return result;
            }

            function calculate() {
                var inputs = [fname, sname],
                    loves = ["l", "o", "v", "e", "s"],
                    countArray = [],
                    count,
                    names,
                    jointNames;

                names = "" + inputs[0] + "" + inputs[1] + "";
                jointNames = names.toLowerCase();
                countArray = loves.map(function (item) {
                    count = 0;
                    for (var i = 0; i < jointNames.length; i += 1) {
                        if (item === jointNames[i]) {
                            count += 1;
                        }
                    }
                    return count;
                });
                love(countArray);
            }

            calculate();
        } catch (error) {
            console.log(error);
        }
    },
};
