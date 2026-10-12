module.exports.config = {
  name: "prefix",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "MR JUWEL",
  description: "Display bot prefix, owner info & stats",
  commandCategory: "Information",
  usages: "",
  cooldowns: 5
};

// 🚫 Anti-spam store
const spamMap = new Map();
const SPAM_COOLDOWN = 10000; // 10 seconds

module.exports.handleEvent = async ({ event, api, Threads }) => {
  const { threadID, messageID, body, senderID } = event;
  if (!body) return;

  // 🚫 Anti-spam check
  const now = Date.now();
  if (spamMap.has(senderID)) {
    if (now - spamMap.get(senderID) < SPAM_COOLDOWN) return;
  }

  // ⚙️ Prefix & thread info
  let prefix = global.config.PREFIX;
  let groupName = "Unnamed Group";
  try {
    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    prefix = threadSetting.PREFIX || global.config.PREFIX;

    const dataThread = await Threads.getData(threadID);
    groupName = dataThread?.threadInfo?.threadName || "Unnamed Group";
  } catch (e) {
    // ignore errors, use defaults
  }

  // 🌐 Multi-language trigger words
  const triggerWords = [
    // English
    "prefix", "mprefix", "mpre", "bot prefix", "what is the prefix", "bot name",
    "how to use bot", "bot not working", "bot is offline", "prefx", "prfix",
    "perfix", "bot not talking", "where is bot", "bot dead", "bots dead",
    "what prefix", "freefix", "what is bot", "what prefix bot",
    "how use bot", "where are the bots", "where prefix",
    // Bangla
    "প্রিফিক্স", "বট প্রিফিক্স", "পিন", "বটের নাম", "বট কি",
    "বট কাজ করছে না", "বট অফলাইন", "প্রিফিক্স কি",
    // Hindi
    "प्रीफिक्स", "बॉट प्रीफिक्स", "बॉट का नाम", "बॉट क्या है",
    // Vietnamese
    "dấu lệnh", "daulenh", "tiền tố"
  ];

  const lowerBody = body.toLowerCase().trim();
  if (!triggerWords.includes(lowerBody)) return;

  spamMap.set(senderID, now);

  // 💖 Random reaction
  const reactions = ["💖", "✨", "🌸", "💫", "❤️", "🦋", "🌟"];
  api.setMessageReaction(
    reactions[Math.floor(Math.random() * reactions.length)],
    messageID, () => {}, true
  );

  // 🕐 Time-based greeting
  const hour = new Date().getHours();
  let greet = "🌙 Good Night";
  if (hour >= 5 && hour < 12) greet = "🌅 Good Morning";
  else if (hour >= 12 && hour < 17) greet = "☀️ Good Afternoon";
  else if (hour >= 17 && hour < 21) greet = "🌆 Good Evening";

  // 📊 Uptime & Stats
  const uptimeSec = process.uptime();
  const days  = Math.floor(uptimeSec / 86400);
  const hours = Math.floor((uptimeSec % 86400) / 3600);
  const mins  = Math.floor((uptimeSec % 3600) / 60);
  const uptimeStr = `${days}d ${hours}h ${mins}m`;

  const totalUsers   = global.data.allUserID?.length   || 0;
  const totalThreads = global.data.allThreadID?.length || 0;

  // 🎯 Fixed values (100% কাজ করবে)
  const botName   = "⎯꯭𓆩꯭𝆺𝅥😻⃞𝐑⃞𝐈⃞𝐘𝐀⃞༢࿐";
  const ownerName = "⎯꯭𓆩꯭𝆺𝅥😻⃞𝐌⃞𝆠፝֟𝐑᭄ღ 𝐓⃞𝐀⃞𝐌⃞𝐈⃞𝐌༢࿐";
  const ownerMSG  = "tamim09";
  const ownerWA   = "01849925507";
  const adminUID  = (global.config.ADMINBOT && global.config.ADMINBOT[0]) || "N/A";

  // 📩 Send formatted message
  return api.sendMessage(
`╔═─━⌬ PREFIX SYSTEM ⌬━─═╗
║  ${greet}
║
║  ✦ 『 𝐁𝐎𝐓 𝐈𝐍𝐅𝐎 』
║  ━━━━━━━━━━━━━━━
║  ➤ ✅ Prefix : 『 ${prefix} 』
║  ➤ 🤖 Name   : ${botName}
║  ➤ 👑 Admin  : ${ownerName}
║  ➤ ⏱️ Uptime : ${uptimeStr}
║  ➤ 👥 Users  : ${totalUsers}
║  ➤ 💬 Groups : ${totalThreads}
║
║  ✦ 『 𝐁𝐎𝐗 𝐈𝐍𝐅𝐎 』
║  ━━━━━━━━━━━━━━━
║  ➤ 📌 Box Prefix : ${prefix}
║  ➤ 🏷️ Name       : ${groupName}
║  ➤ 🆔 Thread ID  : ${threadID}
║
║  ✦ 『 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎 』
║  ━━━━━━━━━━━━━━━
║  ➤ 👤 Name : ${ownerName}
║  ➤ 🆔 UID  : ${adminUID}
║  ➤ 💬 MSG  : ${ownerMSG}
║  ➤ 📱 WA   : ${ownerWA}
║
╠═━⌬ THANK YOU ⌬━═╣
║  Thanks for using RIYA BOT ✨
╚═━━⌬ POWERED BY TAMIM ⌬━━═╝`,
    threadID,
    null
  );
};

module.exports.run = async ({ event, api }) => {
  return api.sendMessage(
    "💡 Type 'prefix' / 'প্রিফিক্স' / 'प्रीफिक्स' to get the bot info.",
    event.threadID
  );
};
