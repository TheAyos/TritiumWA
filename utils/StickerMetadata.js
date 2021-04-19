module.exports.addMetadata = addMetadata;

async function addMetadata(file, packname, author) {
  const emojiRegex = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu; // mAgIc
  const stickerpackid = "com.youbyoubwasthere.wa.stickerapp xxxxxxxx-xxxx-hayz-dwdf-rxxxxxxxxxxx";
  const json = {
    "sticker-pack-id": stickerpackid,
    "sticker-pack-name": packname.replace(emojiRegex, ""),
    "sticker-pack-publisher": author.replace(emojiRegex, ""),
  };

  const littleEndian = Buffer.from([
    0x49,
    0x49,
    0x2a,
    0x00,
    0x08,
    0x00,
    0x00,
    0x00,
    0x01,
    0x00,
    0x41,
    0x57,
    0x07,
    0x00,
  ]);
  const bytes = [0x00, 0x00, 0x16, 0x00, 0x00, 0x00];

  let len = JSON.stringify(json).length;
  let last;

  if (len > 256) {
    len = len - 256;
    bytes.unshift(0x01);
  } else {
    bytes.unshift(0x00);
  }

  if (len < 16) {
    last = len.toString(16);
    last = "0" + len;
  } else {
    last = len.toString(16);
  }

  const buf2 = Buffer.from(last, "hex");
  const buf3 = Buffer.from(bytes);
  const buf4 = Buffer.from(JSON.stringify(json));

  const buffer = Buffer.concat([littleEndian, buf2, buf3, buf4]);

  let name = Math.random().toString(36).substring(7);

  let tempFile = `./temp/sticker/${name}.exif`;

  const { writeFileSync, unlinkSync } = require("fs");
  const { execSync } = require("child_process");

  writeFileSync(`${tempFile}`, buffer);
  execSync(`webpmux -set exif ${tempFile} ${file} -o ${file}`);

  try {
    //console.log(`Cleaning ${tempFile}...`);
    unlinkSync(`${tempFile}`);
  } catch (e) {
    console.log("StickerMeta: Unable to clean temp file:\n" + e);
  }

  return `${tempFile}`;
}
