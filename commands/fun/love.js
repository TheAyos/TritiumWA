const TritiumCommand = require('../../models/TritiumCommand');

const { readFileSync } = require('fs');

module.exports = new TritiumCommand(
    async ({ Tritium, msg, args }) => {
        if (args.length > 2) return Tritium.reply(msg.from, 'Calm down ! Two people is already enough !', msg.id);

        let fname = '';
        let sname = '';

        const ff = await Tritium.getContact(msg.mentionedJidList[0]);
        console.log(ff);

        console.log(msg.mentionedJidList);
        console.log(msg.mentionedJidList.length);

        console.log(fname);
        console.log(sname);
        if (msg.mentionedJidList.length === 1 && args.length === 2) {
            const ff = await Tritium.getContact(msg.mentionedJidList[0]);
            fname = ff.pushname || ff.formattedName;
            sname = ff.pushname || ff.formattedName;
        } else if (msg.mentionedJidList.length === 2) {
            const ff = await Tritium.getContact(msg.mentionedJidList[0]);
            const ss = await Tritium.getContact(msg.mentionedJidList[1]);
            fname = ff.pushname || ff.formattedName;
            sname = ss.pushname || ss.formattedName;
        } else {
            fname = args[0];
            sname = args[1];
        }
        console.log(fname);
        console.log(sname);

        const result = calculateLove(fname, sname);

        let emoji = '';
        let advice = '';
        let reactionGif = '';

        if (result === 0) (emoji = '💔') && (advice = 'No relationship is possible.');
        if (result < 25) {
            emoji = '💔';
            advice = "It's low, but don't give up.";
            reactionGif = Tritium.fromRootPath(`assets/love/crying${Math.floor(Math.random() * 4) + 1}.webp`);
        } else if (result < 50) {
            emoji = '❤️';
            advice = "It's below average, you have to find someone else.";
            reactionGif = Tritium.fromRootPath(`assets/love/nope${Math.floor(Math.random() * 5) + 1}.webp`);
        } else if (result < 75) {
            emoji = '💗';
            advice = "It's a great score!";
            reactionGif = Tritium.fromRootPath(`assets/love/neutral${Math.floor(Math.random() * 4) + 1}.webp`);
        } else if (result <= 100) {
            emoji = '💞';
            advice = 'A relationship is possible !';
            reactionGif = Tritium.fromRootPath(`assets/love/happy${Math.floor(Math.random() * 5) + 1}.webp`);
        }
        try {
            reactionGif = readFileSync(reactionGif, { encoding: 'base64' });
            // look weird on phone (not correctly cropped)
            // await Tritium.sendRawWebpAsSticker(msg.from, reactionGif);
            await Tritium.sendText(msg.from, `*${fname}* _*+*_ *${sname}* = ${result}% ${emoji}\n${advice}`);
        } catch (e) {
            Tritium.logger.error(e);
        }
    },
    {
        triggers: ['love', 'lovecount', 'lc'],
        usage: '{command} [name] [name]',
        example: '{command} chaplin dicaprio',
        description: 'Calculate the love percentage between two users.💞',

        cooldown: 10,
        groupOnly: true,
        minArgs: 2,
        missingArgs: 'Enter two names 🙄!',
    },
);

function calculateLove(Fname, Sname) {
    Fname = Fname.toString().toUpperCase();
    Sname = Sname.toString().toUpperCase();
    const FnameLength = Fname.length;
    const SnameLength = Sname.length;
    let lovecount = 0;
    for (let i = 0; i < FnameLength; i++) {
        const L1 = Fname.substring(i, i + 1);
        if (L1 == 'A') lovecount += 3;
        if (L1 == 'E') lovecount += 3;
        if (L1 == 'I') lovecount += 3;
        if (L1 == 'O') lovecount += 3;
        if (L1 == 'U') lovecount += 4;
        if (L1 == 'L') lovecount += 1;
        if (L1 == 'V') lovecount += 4;
    }

    for (let count = 0; count < SnameLength; count++) {
        const L2 = Sname.substring(count, count + 1);
        if (L2 == 'A') lovecount += 3;
        if (L2 == 'E') lovecount += 3;
        if (L2 == 'I') lovecount += 3;
        if (L2 == 'L') lovecount += 3;
        if (L2 == 'O') lovecount += 4;
        if (L2 == 'V') lovecount += 1;
        if (L2 == 'E') lovecount += 4;
    }
    let Total = 0;
    if (lovecount > 0) Total = 5 - (FnameLength + SnameLength) / 2;
    if (lovecount > 2) Total = 10 - (FnameLength + SnameLength) / 2;
    if (lovecount > 4) Total = 20 - (FnameLength + SnameLength) / 2;
    if (lovecount > 6) Total = 30 - (FnameLength + SnameLength) / 2;
    if (lovecount > 8) Total = 40 - (FnameLength + SnameLength) / 2;

    if (lovecount > 10) Total = 50 - (FnameLength + SnameLength) / 2;

    if (lovecount > 12) Total = 60 - (FnameLength + SnameLength) / 2;
    if (lovecount > 14) Total = 70 - (FnameLength + SnameLength) / 2;
    if (lovecount > 16) Total = 80 - (FnameLength + SnameLength) / 2;
    if (lovecount > 18) Total = 90 - (FnameLength + SnameLength) / 2;
    if (lovecount > 20) Total = 100 - (FnameLength + SnameLength) / 2;
    if (lovecount > 22) Total = 110 - (FnameLength + SnameLength) / 2;
    if (FnameLength == 0 || SnameLength == 0) Total = 'Error';
    if (Total < 0) Total = 0;
    if (Total > 99) Total = 99;

    return Math.floor(Total).toString();
}
/*
function calculate(fname, sname) {
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
  
  let result = love(countArray);
  console.log(result);
  return result + "%";
}

 function love(array) {
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
          console.log("Splitting" + item + " into " + item.toString()[0] + " and " + item.toString()[1]);
          hold.push(parseInt(item.toString()[0]));
          hold.push(parseInt(item.toString()[1]));
        }
      }
    });
    love(hold);
  } else {
    result = parseInt(array[0] + "" + array[1]);
    return result;
  }
}
*/
