module.exports = (client, chat) => {
    client.sendText(
        chat.groupMetadata.id,
        `Thanks for adding me to *${chat.contact.name}*.\nUse ${client.prefix}help to see the usable commands`,
    );
    console.log(chat);
};
