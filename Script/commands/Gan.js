const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');

let lastPlayed = -1;

module.exports.config = {
    name: 'gan',
    version: '1.1.0',
    hasPermission: 0,
    credits: 'MR JUWEL',
    description: 'Play random song without prefix',
    commandCategory: 'music',
    usages: 'gan',
    cooldowns: 5
};

async function playSong(api, event) {
    const { threadID, messageID } = event;
    const songs = [
        'https://files.catbox.moe/etsdn9.mp3',
        'https://files.catbox.moe/ayepdz.mp3',
        'https://files.catbox.moe/oaecnx.mp3',
        'https://files.catbox.moe/gvvb82.mp3',
        'https://files.catbox.moe/bmk3mq.mp3',
        'https://files.catbox.moe/tht37y.mp3',
        'https://files.catbox.moe/9i3g65.mp3',
        'https://files.catbox.moe/ap2yed.mp3',
        'https://files.catbox.moe/o5l5uj.mp3',
        'https://files.catbox.moe/0j7oho.mp3',
        'https://files.catbox.moe/kffipu.mp3',
        'https://files.catbox.moe/azjd00.mp3'
    ];

    api.setMessageReaction('🎶', messageID, () => {}, true);

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * songs.length);
    } while (randomIndex === lastPlayed && songs.length > 1);

    lastPlayed = randomIndex;

    const songNumber = randomIndex + 1;
    const songUrl = songs[randomIndex];
    const cacheDir = path.join(__dirname, 'cache');

    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }

    const filePath = path.join(cacheDir, 'gan_' + songNumber + '_' + Date.now() + '.mp3');

    try {
        const response = await axios({
            url: songUrl,
            method: 'GET',
            responseType: 'stream',
            timeout: 30000
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage({
                body: 'MR JUWEL\n\n🎵 Song No: ' + songNumber + '/' + songs.length + '\n🔀 Mode: No Prefix\n\nEnjoy 🎶',
                attachment: fs.createReadStream(filePath)
            }, threadID, () => {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        });
    } catch (error) {
        api.sendMessage('❌ গান পাঠাতে সমস্যা হয়েছে!', threadID);
    }
}

module.exports.handleEvent = async function ({ api, event }) {
    if (!event.body) return;
    const message = event.body.trim().toLowerCase();
    if (message === 'gan') {
        return playSong(api, event);
    }
};

module.exports.run = async function ({ api, event }) {
    return playSong(api, event);
};
