module.exports = async (client, msg) =>
    require(client.fromRootPath("handlers/handler.js"))(client, msg);
