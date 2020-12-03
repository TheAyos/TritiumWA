const { decryptMedia } = require('@open-wa/wa-decrypt')
//const nrc = require('node-run-cmd')
const fs = require('fs');
const { exec } = require('child_process');

exports.run = async (client, message, args) => {
    try {
        client.reply(message.from, 'Ton sticker arrive 🦅 !', message.id);
        const isQuotedImage = message.quotedMsg && message.quotedMsg.type === 'image'

        if ((message.isMedia || isQuotedImage) && args.length === 0) {
            const encryptMedia = isQuotedImage ? message.quotedMsg : message
            const _mimetype = isQuotedImage ? message.quotedMsg.mimetype : message.mimetype
            const mediaData = await decryptMedia(encryptMedia)
            const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
            const fileName = `./${message.from}.webp`
            await fs.writeFileSync(fileName, mediaData)
            await exec(`webpmux -set exif STK-20201118-WA0114.webp ${fileName} -o ${fileName}`)
            //const contents = await fs.readFileSync(`./${message.from}.webp`, { encoding: 'base64' })
            const contents = await fs.readFileSync(fileName, { encoding: 'base64' })
            await client.sendRawWebpAsSticker(message.from, contents);
            client.reply(message.from, 'Here\'s your sticker');
            //await client.sendRawWebpAsSticker(message.from, contents)
            //client.reply(message.from, 'Here\'s your sticker')
        }
    } catch (error) {
        console.log(error);
    }
}
