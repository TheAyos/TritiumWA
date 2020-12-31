const { createCanvas, loadImage, registerFont } = require("canvas");

// TODO: leave/join msg differentiation & make a function (refactor)
// TODO: add custom bg support per server ||=>choose wheter or not say the grp description etc...
// TODO: `Welcome to *${groupname}!* \n\n@${event.who.replace('@c.us', '')} \n\nHave fun with us✨ \n\n *Group Description* ❇️ \n\n ${det.groupMetadata.desc}`

module.exports = async (Tritium, event) => {
  try {
    //if (event.action !== "add") return;
    const groupObj = await Tritium.getChatById(event.chat);
    const userObj = await Tritium.getContact(event.who);
    const username = userObj.pushname;
    const groupname = groupObj.formattedTitle;

    //// segoe helps with the emojis
    registerFont(Tritium.fromRootPath("assets/fonts/seguiemj.ttf"), { family: "segoe-ui-emoji" });
    registerFont(Tritium.fromRootPath("assets/fonts/theboldfont.ttf"), { family: "Boldmoji" });
    const defaultBg = Tritium.fromRootPath("assets/images/welcome_bg_default.png");
    const defaultPfp = Tritium.fromRootPath("assets/images/welcome_nopp.png");
    /**
     * @param {string} message Main message
     * @param {string} username User's name
     * @param {string} userObj User object
     * @param {string} groupObj The joined group's object
     * @returns {string} attachement string -> base64
     */
    // TODO: working on that
    function getWelcomeImage(message, username, userObj, groupObj) {
      return;
    }
    const canvas = createCanvas(1024, 450);
    const ctx = canvas.getContext("2d");

    const bg = await loadImage(defaultBg);
    let x = 0,
      y = 0;
    ctx.drawImage(bg, x, y, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(59, 249, 246, .6)";
    ctx.lineWidth = 30;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    let hasPfp = await Tritium.getProfilePicFromServer(userObj.id);
    let avatar;
    if (hasPfp) {
      avatar = await loadImage(userObj.profilePicThumbObj.eurl);
    } else {
      avatar = await loadImage(defaultPfp);
    }

    /*let avatar = userObj.profilePicThumbObj
      ? await loadImage(userObj.profilePicThumbObj.eurl)
      : await loadImage(defaultPfp);*/

    //Draw avatar
    // Save clip() path to restore after
    ctx.save();
    //let avatarWidth = (canvas.height * 2) / 3;
    let avatarWidth = (canvas.height * 1) / 2;
    let radius = avatarWidth / 2;
    x = canvas.width / 2;
    //y = (canvas.height * 1) / 6;
    y = avatarWidth / 4;
    ctx.beginPath();
    ctx.lineWidth = 20;
    ctx.strokeStyle = "rgba(243, 89, 142, .85)";
    ctx.arc(x, y + avatarWidth / 2, radius, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    x = canvas.width / 2 - avatarWidth / 2;
    ctx.drawImage(avatar, x, y, avatarWidth, avatarWidth);
    ctx.restore();

    // Draw welcome
    let text = `WELCOME  💎 ${username}`;
    let strokedText = "WELCOME";
    ctx.strokeStyle = "rgba(255, 139, 57, .9)";
    ctx.lineWidth = 12;
    ctx.font = "45px Boldmoji";
    ctx.fillStyle = "#ffffff";
    x = canvas.width / 2 - ctx.measureText(text).width / 2; // centers the text
    y = canvas.height - 100;
    ctx.strokeText(strokedText, x, y);
    ctx.fillText(text, x, y);

    // Draw member number #
    let placeInGrp = groupObj.groupMetadata.participants.length.toOrdinal();
    ctx.font = fitText(ctx, groupname, 35, 600, "Boldmoji");
    text = `> ${placeInGrp} member in ${groupname}`;
    x = canvas.width / 2 - ctx.measureText(text).width / 2;
    y = canvas.height - 35;
    ctx.fillText(text, x, y);

    const attachement = `data:image/png;base64,${canvas.toBuffer().toString("base64")}`;
    await Tritium.sendImage(event.chat, attachement, "welcome.png", "");

    let welcomeMsg = `*Welcome to the server, @${userObj.id.split("@").shift()} !*`;
    await Tritium.sendTextWithMentions(event.chat, welcomeMsg);
  } catch (error) {
    console.log(error);
  }
};

function fitText(ctx, text, desiredFontSize, width, font) {
  do {
    ctx.font = `${(desiredFontSize -= 1)}px ${font}`;
  } while (ctx.measureText(text).width > width);
  return ctx.font;
}
