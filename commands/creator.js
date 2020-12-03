module.exports = {
    run: async (client, message) => {
        try {
            await client.sendContact(message.from, '212641715835@c.us')
        } catch (error) {
            console.log(error);
        }
    }
}