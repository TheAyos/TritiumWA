const jikan = "https://api.jikan.moe/v3/";
const moment = require('moment-timezone')
const processTime = (timestamp, now) => {
    return moment.duration(now - moment(timestamp * 1000)).asSeconds()
}
module.exports = {
    moment,
    processTime,
    jikan
}