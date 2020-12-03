const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs')
//const request = require('request');

exports.run = async (client, message, args) => {
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
            if (result < 25) {
                const crying = await fs.readFileSync(`./assets/love/crying${Math.floor(Math.random() * 4) + 1}.gif`, { encoding: 'base64' });
                console.log(crying)
                await client.sendImageAsSticker(message.from, crying);
            } else if (result < 50) {
                client.sendImageAsSticker(message.from, `../assets/love/nope${Math.floor(Math.random() * 5) + 1}.gif`);
            } else if (result < 75) {
                client.sendImageAsSticker(message.from, `../assets/love/neutral${Math.floor(Math.random() * 4) + 1}.gif`);
            } else if (result <= 100) {
                client.sendImageAsSticker(message.from, `../assets/love/happy${Math.floor(Math.random() * 5) + 1}.gif`);
            }
            client.sendText(message.from, `*${fname}* _*+*_ *${sname}* = ${array[0] + "" + array[1]}%\n`);
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
    /*const options = {
        method: 'GET',
        url: 'https://love-calculator.p.rapidapi.com/getPercentage',
        qs: { fname: fname, sname: sname },
        headers: {
            'x-rapidapi-key': '800da5a831msh6536a6a26e6b675p143056jsnc5446948e844',
            'x-rapidapi-host': 'love-calculator.p.rapidapi.com',
            useQueryString: true
        }
    };

    request(options, function (error, response) {
        if (error) throw new Error(error);
        res = JSON.parse(response.body);
        client.reply(message.from, `_${res.result}_`, message.id);

    });*/
}