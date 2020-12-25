const WMStrm = require("./WMStrm");

const moment = require("moment-timezone");
const jikan = "https://api.jikan.moe/v3/";
const processTime = (timestamp, now) => {
    return moment.duration(now - moment(timestamp * 1000)).asSeconds();
};
module.exports = {
    WMStrm,
    moment,
    processTime,
    jikan,
};
