module.exports = (chat) => {
    client.sendText(
        chat.groupMetadata.id,
        `Thanks for adding me *${chat.contact.name}*. Use ${client.prefix}help to see the usable commands`,
    );
};
