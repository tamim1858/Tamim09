'use strict';

const moment = require('moment-timezone');

// ===== Bot Detection Keywords =====
const botKeywords = [
  'your keyboard level has reached level',
  'Command not found',
  'The command you used',
  'Uy may lumipad',
  'Unsend this message',
  'You are unable to use bot',
  '»» NOTICE «« Update user nicknames',
  'just removed 1 Attachments',
  'message removedcontent',
  'The current preset is',
  'Here Is My Prefix',
  'just removed 1 attachment.',
  'Unable to re-add members',
  'removed 1 message content:',
  "Here's your music, enjoy!🥰",
  'Ye Raha Aapka Music, enjoy!🥰',
  'your keyboard Power level Up',
  'your keyboard hero level has reached level',
  'Error: Cannot read properties of undefined',
  'Error in onChat: Request failed with status code 500',
  'Error: Failed to fetch list',
  "What's up?",
  '❌ Please provide a question or prompt.',
  'Hi there! How can I help you today?',
  'Hello! How can I help you today?',
  'Wait koro baby 😽',
  'Generation failed!',
  'Error: Request failed with status code 404',
  'Request failed with status code 500.',
  'An error',
  '❌ Error',
  '❌ Please provide an image URL',
  '🔍 Platform detected: TikTok',
  "🤖 𝙷𝚞𝚑! 𝚃𝚑𝚊𝚝 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚍𝚘𝚎𝚜𝚗'𝚝 𝚎𝚡𝚒𝚜𝚝",
  '🤖 𝗖ᴏᴍᴍᴀɴᴅ ɴᴏᴛ ғᴏᴜɴᴅ',
  'Hey senpai!',
  'Error api Response ❌',
  'ℹ️ [!] ɪғ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ɴᴏᴛ',
  '🌸 Assalamualaikum 🌸',
  '🌺 Thank you so much for using my bot in your group ❤️‍🩹',
  '😻 I hope all members enjoy! 🤗',
  '🔰 To view commands 📌',
  '𝐁𝐨𝐭 𝐎𝐰𝐧𝐞𝐫 ➢',
  '⏳𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁....',
  '✖ 𝗖𝗺𝗱 𝗡𝗼𝘁 𝗙𝗼𝘂𝗻𝗱.',
  '━━━━━━━━━━━━━━━',
  '➤ 𝗗𝗶𝗱 𝘆𝗼𝘂 𝗺𝗲𝗮𝗻 ❝ ❞',
  '⚠️ একটি ত্রুটি ঘটেছে, দয়া করে পরে আবার চেষ্টা করুন।',
  'তাহলে মায়াবতী কে আমাকে দাও',
  'বেশি Bot Bot করলে leave নিবো কিন্তু😒',
  '⚠️ Sorry Boss এই আবালকে অ্যাড করলাম না',
  'এত হাই-হ্যালো কর ক্যান প্রিও',
  '⚠️ দুঃখিত, আমি ইউজারটাকে আবার অ্যাড করতে পারিনি',
  'হাঁসতে ছে নাকি আমার কষ্ট দেখে',
  'বার বার ডাকলে মাথা গরম হয়ে যায় কিন্তু😑',
  'হ্যা বলো😒, তোমার জন্য কি করতে পারি',
  'আরে Bolo আমার জান',
  'অসম্মান করছিস😰😿',
  'Hop beda😾 Boss বল boss😼',
  'বট বলে চলে যাস কেন😤🥺কী হলো উওর দে🥺',
  'বার বার Disturb করছিস কোনো😾',
  'আমারে এতো ডাকিস না আমি মজা করার mood এ নাই এখন😒',
  'দূরে যা, তোর কোনো কাজ নাই, শুধু bot bot করিস',
  'আমাকে ডেকো না,আমি ব্যাস্ত আছি',
  'কি হলো , মিস্টেক করচ্ছিস নাকি🤣',
  'বলো কি বলবা, সবার সামনে বলবা নাকি',
  'হা বলো, শুনছি আমি 😏',
  'আর কত বার ডাকবি ,শুনছি তো',
  'বলো কি করতে পারি তোমার জন্য',
  'আমি তো অন্ধ কিছু দেখি না🐸 😎',
  'তোর কি চোখে পড়ে না আমি রাহাদ জানুর সাথে ব্যাস্ত আছি😒',
  'আসসালামু আলাইকুম বলেন আপনার জন্য কি করতে পারি',
  '🌻🌺💚আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ',
  'আমি এখন বস রাহাদ এর সাথে বিজি আছি আমাকে ডাকবেন না',
  'আজকে আমার মন ভালো নেই তাই আমারে ডাকবেন না',
  'চুনা ও চুনা আমার বস রাহাদ এর হবু বউ রে কেও দেকছো',
  'ইসস এতো ডাকো কেনো লজ্জা লাগে তো',
  'আমার বস রাহাদ এর পক্ষ থেকে তোমারে এতো এতো ভালোবাসা',
  'দিন দিন কিছু মানুষের কাছে অপ্রিয় হয়ে যাইতেছি',
  'দুনিয়ার সবাই প্রেম করে.!🤧 -আর মানুষ আমার বস রাহাদ কে সন্দেহ করে',
  'আমার থেকে ভালো অনেক পাবা-🙂 -কিন্তু সব ভালো তে কি আর ভালোবাসা থাকে',
  'অবহেলা করিস না-😑😪 - যখন নিজেকে বদলে ফেলবো -😌',
  'বন্ধুর সাথে ছেকা খাওয়া গান শুনতে শুনতে-🤧 -এখন আমিও বন্ধুর 𝙴𝚇 কে অনেক 𝙼𝙸𝚂𝚂 করি',
  '৯৯টাকায় ৯৯জিবি ৯৯বছর-☺️🐸 -অফারটি পেতে এখনই আমাকে প্রোপস করুন',
  'যেই আইডির মায়ায় পড়ে ভুল্লি আমারে.!🥴- তুই কি যানিস সেই আইডিটাও আমি চালাইরে.!🙂',
  'আরে 𝗕𝗼𝗹𝗼 আমার জান ,কেমন আছো?😚',
  'আরে বোকা বট না জানু বল জানু😌',
  'এতো ডাকছিস কেন?গালি শুনবি নাকি? 🤬',
  '⎯͢⎯⃝🩵আ্ঁজ্ঁকে্ঁ ভা্ঁলো্ঁ হ্ঁয়েঁ গেঁছি্ঁ দেঁই্ঁখা্ঁ কি্ঁছু্ঁ',
  'ক্ঁই্ঁলা্ঁম্‌ঁ নাঁ',
  '😒⎯͢⎯⃝🩷🍒⎯͢⎯⃝',
  "কি're গ্রুপে দেখি একটাও বেডি নাই-🤦‍🥱💦",
  '𝘁𝗼𝗺𝗮𝗸𝗲 𝗱𝗲𝗸𝗵𝗶 🥺😆',
  '😲🧸👀', '😲🧸😼', '😲🧸😚', '😲🧸🥴', '😲🧸🐸',
  '😤😤😎', '😤😤🚶',
  '𝗬𝗼𝘂🥳🥳', '𝗝𝗮𝗻𝗶𝗻𝗮🐐', '𝗛𝗶𝗵𝗶😀', '😒😒 😘',
  '𝗼𝗸𝘆 𝗯𝗯𝘆😆', '𝗼𝗸𝘆 𝗯𝗯𝘆🐥',
  '𝐭𝐮𝐦𝐢 𝐩𝐨𝐜𝐚 🥰', '𝗽𝗿𝗲 𝗶𝘀 𝗮 𝗽𝗿𝗲𝗳𝗶𝘅',
  '𝗡𝗼 𝗻𝗼😦', '𝗩𝗮𝗹𝗼 𝘁𝘂𝗺𝗶😆', '𝗡𝗼𝗽𝗲𝗲🫡',
  'Yes 😀, I am here', '𝗔𝗺𝗶 𝗮𝗿 𝘁𝘂𝗺𝗶😟', '𝗔𝗹𝗹𝗮𝗵 𝗛𝗮𝗳𝗲𝗲𝘇😡',
  '𝗮𝗺𝗻𝗶😴😴', '𝘆𝗼𝘂 𝘁𝗼𝗼😼', '𝗸𝗶 𝗯𝗼𝗹𝗯𝗲 𝗯𝗼𝗹𝗼🤒',
  '𝗸𝗮𝗿 𝗷𝗼𝗻𝗻𝗼 𝗮𝘁𝗼 𝗹𝗼𝘃𝗲🦆', '𝘁𝗼𝗿 𝗸𝗮𝘀𝗲𝗶 𝗿𝗮𝗸🐥',
  '𝗛𝗺𝗺 𝗰𝗵𝗼𝗹 𝗹𝗮𝗺 𝘁𝗼😘', '𝗰𝗵𝗶𝗽𝗮𝗶😗', '𝗛𝘂𝗵🙂',
  '𝘀𝗲𝗻𝘁𝗶 𝗻𝗮 𝗸𝗵𝗮𝘆𝗲', '𝗢𝗸𝗮𝘆👋👋', '𝗧𝗵𝗶𝗸 𝗮𝗰𝗵𝗲🌝',
  '𝗔𝘆😾', '𝗲𝗳𝗴𝗵🤷', '𝗡𝗮😃', '𝗶 𝗹𝗮𝗽 𝘂 𝗯𝗯𝘆🐐',
  '𝗛𝗺𝗺🫰', '𝘁𝘂𝗶 𝘁𝗼 𝘃𝗹𝗼𝗶 𝘀𝘆𝘁𝗻 😡', '😁🫵', '😑🦧👽',
  '𝗩𝗹𝗼🩵🩵', '🤦🤷‍♀️😵‍💫', '𝗢𝗸𝗸 𝗯𝗯𝘂🧑‍🍼',
  '𝗣𝗿𝗲𝗴𝗻𝗮𝗻𝘁👋', '𝗕𝗮𝗻𝗱𝗼𝗿 𝗵𝗼𝗶𝗹𝗻 𝗻𝗮𝗸𝗶😡',
  '𝗢𝗸😏', '𝗞𝗻😴😴', '𝗵𝗶𝗵𝗶😏',
  'وَعَلَيْكُمُ السَّلَامُ'
];

// ===== Config =====
module.exports.config = {
  name: 'botautoban',
  version: '3.0.0',
  hasPermssion: 0,
  credits: '乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐',
  description: 'অন্যান্য বট শনাক্ত করে স্বয়ংক্রিয়ভাবে ব্যান করে',
  commandCategory: 'system',
  usages: '',
  cooldowns: 0
};

// ===== Helper =====
function isBotMessage(body) {
  if (!body || typeof body !== 'string') return false;
  return botKeywords.some(keyword => body.includes(keyword));
}

// ===== handleEvent =====
module.exports.handleEvent = async function ({ api, event }) {
  try {
    const { body, threadID, senderID, messageID } = event;

    // Skip if no body or sender is missing
    if (!body || !senderID || !threadID) return;

    // Check if message matches bot keyword
    if (!isBotMessage(body)) return;

    // 🛡️ Safety: don't ban admins or self
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      if (threadInfo.adminIDs && threadInfo.adminIDs.some(a => a.id === senderID)) {
        return; // Skip admins
      }
      if (senderID === api.getCurrentUserID()) return;
    } catch (e) {
      // If we can't fetch info, continue silently
    }

    // Ban (kick) the suspected bot
    await api.removeUserFromGroup(senderID, threadID);
    console.log(`[botautoban] Removed suspected bot ${senderID} from ${threadID}`);

  } catch (err) {
    console.error('[botautoban] handleEvent error:', err && err.message ? err.message : err);
  }
};

// ===== run (manual command) =====
module.exports.run = async function ({ api, event }) {
  try {
    const { threadID, messageID } = event;
    const msg = '🤖 Bot Auto-Ban system is active.\nMonitoring and removing bot accounts.';
    await api.sendMessage(msg, threadID, messageID);
  } catch (err) {
    console.error('[botautoban] run error:', err && err.message ? err.message : err);
  }
};
