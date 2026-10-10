const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: 'owner',
    version: '1.0.1',
    hasPermssion: 0,
    credits: 'তামিম',
    description: 'Display bot owner information',
    commandCategory: 'Info',
    usages: '',
    cooldowns: 5,
    dependencies: {
        'axios': '',
        'fs-extra': ''
    }
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID } = event;

    // ক্যাশ ফোল্ডার না থাকলে তৈরি করবে
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }

    const imageUrl = 'https://files.catbox.moe/c8d3h4.jpg';
    const imagePath = path.join(cacheDir, `owner_${Date.now()}.jpg`);

    try {
        // ছবি ডাউনলোড
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 15000
        });
        fs.writeFileSync(imagePath, Buffer.from(response.data));

        const messageBody = 
            '🌟 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 🌟\n\n' +
            '👑 𝗡𝗔𝗠𝗘: তামিম\n' +
            '😻 𝗔𝗗𝗗𝗥𝗘𝗦𝗦: Rajshahi\n' +
            '💼 𝗣𝗥𝗢𝗙𝗘𝗦𝗦𝗜𝗢𝗡: মেয়েদের মন জয় করা😍\n' +
            '🌐 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞: আইডি নেইচ্চা খাইয়া লাইছি😁\n' +
            '💬 𝗠𝗘𝗦𝗦𝗘𝗡𝗚𝗘𝗥: দিলে Future বউ ধইরা মারব😌\n' +
            '📺 𝗬𝗢𝗨𝗧𝗨𝗕𝗘: কবে YouTubal ছিলাম 😺\n' +
            '📸 𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠: গরিব বলে ফেসবুক চালাই শুধু 🥺\n' +
            '📱 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣: 01849925507\n' +
            '🎵 𝗧𝗜𝗞𝗧𝗢𝗞: সরি আমি প্রতিবন্ধী না🥱\n' +
            '👻 𝗦𝗡𝗔𝗣𝗖𝗛𝗔𝗧: তোদের মতো কালা নাকি ফিল্টার লাগামু🤭\n' +
            '😎 𝗦𝗧𝗔𝗧𝗨𝗦: Single but not available 😌\n' +
            '💔 𝗥𝗘𝗟𝗔𝗧𝗜𝗢𝗡𝗦𝗛𝗜𝗣: হৃদয় এখন অফলাইন\n' +
            '⚠️ 𝗪𝗔𝗥𝗡𝗜𝗡𝗚: বেশী মেসেজ দিলে রিপ্লাই পাওয়ার সম্ভাবনা 0.01% 😆\n' +
            '⏰ 𝗔𝗖𝗧𝗜𝗩𝗘: যখন WiFi থাকে তখন 😴\n' +
            '💬 𝗤𝗨𝗢𝗧𝗘: "আমি সিরিয়াস না, কিন্তু ফানি সবসময় 😎"\n' +
            '🏆 𝗥𝗔𝗡𝗞: Local Legend (Village Edition 😂)\n' +
            '🔥 𝗟𝗘𝗩𝗘𝗟: 99% Sarcasm\n' +
            '📵 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣: Seen but ignored 😆\n' +
            '📸 𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠: 0 followers, 1000 dreams\n\n' +
            '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
            '🤖 𝗕𝗢𝗧 𝗕𝗬: তামিম';

        // মেসেজ + ছবি পাঠানো
        api.sendMessage({
            body: messageBody,
            attachment: fs.createReadStream(imagePath)
        }, threadID, (err) => {
            // পাঠানোর পর ছবি ডিলিট
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            if (err) {
                console.error('❌ Send Message Error:', err);
            }
        }, messageID);

    } catch (error) {
        console.error('❌ Owner Command Error:', error.message);
        api.sendMessage(
            '❌ ছবি ডাউনলোড করতে সমস্যা হয়েছে!\n' +
            'কারণ: ' + error.message,
            threadID,
            messageID
        );
    }
};
