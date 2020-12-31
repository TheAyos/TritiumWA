const { createCanvas, loadImage, registerFont } = require("canvas");

module.exports = {
  triggers: ["wel"],
  usage: "{command}",
  description: "test",

  isNSFW: false,
  needArgs: false,
  cooldown: 5,

  run: async function ({ Tritium, msg }) {
    try {
      const defaultBg = await loadImage(Tritium.fromRootPath("assets/images/welcome_bg_default.png"));
      const nopp = await loadImage(Tritium.fromRootPath("assets/images/welcome_nopp.png"));
      const canvas = createCanvas(1024, 450);
      const ctx = canvas.getContext("2d");

      registerFont(Tritium.fromRootPath("assets/fonts/theboldfont.ttf"), { family: "bold" });

      // TODO: add custom bg support per server
      const bg = defaultBg;
      let x = 0,
        y = 0;
      ctx.drawImage(bg, x, y, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(59, 249, 246, .6)";
      ctx.lineWidth = 30;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      /*const data = msg.sender.profilePicThumbObj.eurl
        ? (data = await Tritium.downloadProfilePicFromMessage(msg))
        : (data = await loadImage(defaultBg));*/

      let data = await Tritium.getProfilePicFromServer(msg.sender.id);
      let avatar;
      if (data) {
        data = await Tritium.downloadProfilePicFromMessage(msg);
        avatar = await loadImage(`data:image/jpeg;base64,${data}`);
      } else {
        console.log(data, "UNUNUNUN");
        avatar = await loadImage(defaultBg);
      }

      // Save clip() path to restore after
      ctx.save();

      //Draw avatar
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
      //ctx.arc(180, 225, 135, 0, Math.PI * 2, true);
      //ctx.drawImage(avatar, 45, 90, 270, 270);

      ctx.restore();

      // Draw welcome
      let text = `WELCOME ${msg.sender.pushname}`;
      let strokedText = "WELCOME";
      ctx.strokeStyle = "rgba(255, 139, 57, .8)";
      ctx.lineWidth = 12;
      ctx.font = "45px bold";
      ctx.fillStyle = "#ffffff";
      x = canvas.width / 2 - ctx.measureText(text).width / 2; // centers the text
      y = canvas.height - 100;
      ctx.strokeText(strokedText, x, y);
      ctx.fillText(text, x, y);

      // Draw member number #
      let placeInGrp = msg.chat.groupMetadata.participants.length;
      placeInGrp =
        placeInGrp.toString().slice(-1) === "1"
          ? `${placeInGrp}st`
          : placeInGrp.toString().slice(-1) === "2"
          ? `${placeInGrp}nd`
          : placeInGrp.toString().slice(-1) === "3"
          ? `${placeInGrp}rd`
          : `${placeInGrp}th`;
      ctx.font = fitText(ctx, msg.chat.name, 35, 600, "bold");
      text = `> ${placeInGrp} member in ${msg.chat.name}`;
      x = canvas.width / 2 - ctx.measureText(text).width / 2;
      y = canvas.height - 35;
      ctx.fillText(text, x, y);

      const attachement = `data:image/png;base64,${canvas.toBuffer().toString("base64")}`;
      await Tritium.sendImage(msg.from, attachement, "welcome.png", "");

      let welcomeMsg = `*Welcome to the server, @${msg.sender.id.split("@").shift()} !*`;
      await Tritium.sendTextWithMentions(msg.from, welcomeMsg);
    } catch (error) {
      console.log(error);
    }
  },
};

function fitText(ctx, text, desiredFontSize, width, font) {
  do {
    ctx.font = `${(desiredFontSize -= 1)}px ${font}`;
  } while (ctx.measureText(text).width > width);
  return ctx.font;
}
