const TritiumCommand = require('../../models/TritiumCommand');
const { DEFAULT_STICKERPACK_NAME, DEFAULT_STICKERPACK_AUTHOR } = require('../../config.json');
const { convertGifTransparentWebPAndResize } = require('../../utils/ImageTools');

const { decryptMedia } = require('@open-wa/wa-decrypt');

const TEXT_ERROR_IMAGE_PROCESSING = `I wasn't able to process the image correctly. Sorry budd.`;

module.exports = new TritiumCommand(
    async function ({ Tritium, msg, args, cleanArgs }) {
        try {
            let mediaData = await decryptMedia(msg._encryptedMedia);

            let circle = false;
            let keepScale = true;

            // todo add transparent
            if (args[0] === 'circle') {
                circle = true;
                args.shift();
                cleanArgs = args.join(' ');
            } else if (args[0] === 'fit') {
                keepScale = false;
                args.shift();
                cleanArgs = args.join(' ');
            } else if (args[0] === 'transparent') {
                keepScale = false;
                args.shift();
                cleanArgs = args.join(' ');
                mediaData = await convertGifTransparentWebPAndResize(mediaData);
            }

            if (args.length) {
                let pName = '';
                let pAuthor = '';
                if (args.length === 1) pName = args[0];
                else if (args.length > 1) {
                    cleanArgs = cleanArgs.indexOf('|') > -1 ? cleanArgs.split('|') : args;
                    pName = cleanArgs.shift().trim();
                    pAuthor = cleanArgs.shift().trim();
                    console.log(pName, pAuthor);
                }
                await Tritium.sendImageAsSticker(msg.from, mediaData, { author: pAuthor || DEFAULT_STICKERPACK_AUTHOR, pack: pName || DEFAULT_STICKERPACK_NAME, circle: circle, keepScale: keepScale });
            } else {
                await Tritium.sendImageAsSticker(msg.from, mediaData, { author: DEFAULT_STICKERPACK_AUTHOR, pack: DEFAULT_STICKERPACK_NAME, circle: circle, keepScale: keepScale });
            }
        } catch (error) {
            Tritium.log(error);
            return Tritium.reply(msg.from, TEXT_ERROR_IMAGE_PROCESSING, msg.id);
        }
    },
    {
        triggers: ['sticker', 's', 'stiker'],
        usage: '{command} (with quoted image) <circle OR fit OR transparent> <sticker name> | <sticker author>',
        example: ['{command} (with quoted image) fit', "{command} (with quoted image) circle theayos's | tritium bot", '{command} (with quoted image) transparent'],
        description:
            'Sends a sticker from quoted image. Has multiple options like "circle", "fit" or "transparent".' +
            '\nUse "circle" to make a circle-shaped sticker.' +
            '\nUse "fit" to stretch the image to fill the square of sticker.' +
            '\nUse "transparent" with an image that has a white background to remove it.',

        cooldown: 10,
        minArgs: 'quotedImg',
        groupOnly: true,
    },
);
