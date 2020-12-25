// mostly based on this incredible code from http://codewinds.com/blog/2013-08-19-nodejs-writable-streams.html#storing_data_with_writable_streams

var util = require("util");
var Writable = require("stream").Writable;
var memStore = {};

/* Writable memory stream */
function WMStrm(key, options) {
    // allow use without new operator
    if (!(this instanceof WMStrm)) {
        return new WMStrm(key, options);
    }
    Writable.call(this, options); // init super
    this.key = key; // save key
    memStore[key] = Buffer.from(""); // empty
}
util.inherits(WMStrm, Writable);

WMStrm.prototype._write = function (chunk, enc, cb) {
    // our memory store stores things in buffers
    var buffer = Buffer.isBuffer(chunk)
        ? chunk // already is Buffer use it
        : Buffer.from(chunk, enc); // string, convert

    // concat to the buffer already there
    memStore[this.key] = Buffer.concat([memStore[this.key], buffer]);
    cb();
};

// to access memory from instance
WMStrm.prototype._memStore = memStore;

module.exports = WMStrm;

/*
var wstream = new (require('../utils/WMStrm'))('data');
var stream = await videoReadableStream.pipe(wstream);

stream.on('finish', async function () {
    console.log('finished writing');
    to access written data--> wstream._memStore.data.toString('base64')
    wstream.end();
});*/
