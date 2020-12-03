exports.name = 'love'

/**
 * add userResolvable
 */

exports.desc = 'Calculate the love percentage between two users.💞'
exports.usage = `.prefix${this.name} [name] [name]`;
exports.example = `.prefix${this.name} Chaplin Dicaprio`;

exports.needArgs = true;

exports.run = async function (client, message, args) {

    const fs = require('fs')
    let fname = args[0];
    let sname = args[1];
    if (!args || args.length != 2) {
        client.reply(message.from, "Please enter both names. HELP SEND", message.id);
        return
    }
    async function love(array) {
        var hold = [],
            result,
            newArray;
        if (array.length > 2) {
            newArray = array.map(function (item, index, array) {
                return item + array[index + 1];
            });
            newArray.forEach(function (item) {
                if (typeof item === "number" && !isNaN(item)) {
                    if (item < 10) {
                        hold.push(item);
                    } else if (item > 9) {
                        console.log('Splitting' + item + " into " + item.toString()[0] + " and " + item.toString()[1]);
                        hold.push(parseInt(item.toString()[0]));
                        hold.push(parseInt(item.toString()[1]));
                    }
                }
            });
            love(hold);
        } else {
            result = parseInt(array[0] + "" + array[1]);
            let emoji = '💞';
            let advice = 'A relationship is possible !';

            if (result === 0) {
                emoji = '💔';
                advice = 'No relationship is possible.'
            }

            if (result < 25) {
                emoji = '💔';
                advice = 'No relationship is possible.'
                //const crying = await fs.readFileSync(`./assets/love/crying${Math.floor(Math.random() * 4) + 1}.gif`, { encoding: 'base64' });
                console.log(crying)
                await client.sendImageAsSticker(message.from, crying);
            } else if (result < 50) {
                emoji = '❤️';
                advice = 'It\'s below average, you have to find someone else.'
                //client.sendImageAsSticker(message.from, `../assets/love/nope${Math.floor(Math.random() * 5) + 1}.gif`);
            } else if (result < 75) {
                //client.sendImageAsSticker(message.from, `../assets/love/neutral${Math.floor(Math.random() * 4) + 1}.gif`);
            } else if (result <= 100) {
                //client.sendImageAsSticker(message.from, `../assets/love/happy${Math.floor(Math.random() * 5) + 1}.gif`);
            }
            client.sendText(message.from, `*${fname}* _*+*_ *${sname}* = ${result}% ${emoji}\n${advice}`);
            result = array[0] + "" + array[1] + "%";
            return result;
        }
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
}