const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "love",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "SHAHADAT SAHU",
  description: "Generate a couple banner image using sender and target Facebook UID via Avatar Canvas API",
  commandCategory: "banner",
  usePrefix: true,
  usages: "[@mention | reply]",
  cooldowns: 5
};

module.exports.run = async function ({ event, api }) {
  const { threadID, messageID, mentions, messageReply, senderID } = event;

  // ---- Target ID নির্ণয় ----
  let targetID = null;
  if (mentions && Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
  } else if (messageReply && messageReply.senderID) {
    targetID = messageReply.senderID;
  }

  if (!targetID) {
    return api.sendMessage("Please reply or mention someone......", threadID, messageID);
  }

  if (targetID === senderID) {
    return api.sendMessage("নিজের সাথে love banner বানানো যাবে না 😅", threadID, messageID);
  }

  const captions = [
    "💖 ⎯͢⎯⃝🩷😽 তুমি আমার চোখেতে সরলতার উপমা ⎯͢⎯⃝🩷🐰🍒",
    "💖 🥺❤️ প্রিয়.....! 😊\nকখনো কাঁদাও, কখনো হাসাও,\nআবার কখনো এমন ভালোবাসা দাও,\nযেন পৃথিবীর সব সুখ তোমার মাঝে খুঁজে পাই...! 💔❤️",
    "বিচ্ছেদের পরেও যোগাযোগ রাখার নামই হচ্ছে মায়া ____💖 💗🌺",
    "মানুষ ছেড়ে যায়, কিন্তু স্মৃতি নয়!💖",
    "ইচ্ছে 'গুলো শব্দহীন...!! ভাবনা সে-তো প্রতি দিন..! 🌸💔",
    "ভালোবাসা মানে কেবল প্রেম নয়, বরং যার হাসিতে সকাল শুরু হয় 💖",
    "যে সম্পর্ক চোখে দেখা যায় না, মনে থাকে— সেটাই সত্যিকারের ভালোবাসা 💗",
    "তুমি হয়তো দূরে আছো, কিন্তু অনুভূতির ঠিকানা এখনো তুমি!💞",
    "চোখের ভাষা বোঝে যে, সেই প্রিয় ❤️",
    "তুমি মিষ্টি অভ্যাস— যাকে ছাড়াও থাকা যায় না 💖"
  ];

  const caption = captions[Math.floor(Math.random() * captions.length)];

  // ---- cache folder নিশ্চিত করা ----
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const imgPath = path.join(cacheDir, `love_${senderID}_${targetID}_${Date.now()}.png`);

  try {
    // ---- API list fetch ----
    const apiListRes = await axios.get(
      "https://raw.githubusercontent.com/shahadat-sahu/SAHU-API/refs/heads/main/SAHU-API.json",
      { timeout: 15000 }
    );

    const AVATAR_CANVAS_API = apiListRes?.data?.AvatarCanvas;

    if (!AVATAR_CANVAS_API) {
      throw new Error("AvatarCanvas API endpoint not found in JSON");
    }

    // ---- Avatar API call ----
    const res = await axios.post(
      `${AVATAR_CANVAS_API}/api`,
      {
        cmd: "love",
        senderID,
        targetID
      },
      {
        responseType: "arraybuffer",
        timeout: 20000,
        headers: { "Content-Type": "application/json" }
      }
    );

    // ---- Content-Type যাচাই ----
    const contentType = res.headers?.["content-type"] || "";
    if (!contentType.includes("image")) {
      // JSON error response হতে পারে
      const text = Buffer.from(res.data).toString("utf-8");
      throw new Error(`API did not return image. Response: ${text.slice(0, 200)}`);
    }

    if (!res.data || res.data.byteLength === 0) {
      throw new Error("Empty image buffer received");
    }

    // ---- File write ----
    await fs.writeFile(imgPath, Buffer.from(res.data));

    // ---- Send message ----
    return api.sendMessage(
      {
        body: caption,
        attachment: fs.createReadStream(imgPath)
      },
      threadID,
      (err) => {
        // cleanup (error হলেও)
        try {
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        } catch (e) {
          console.error("[love] cleanup failed:", e.message);
        }
        if (err) console.error("[love] send error:", err);
      },
      messageID
    );

  } catch (err) {
    console.error("[love] Error:", err.message);

    // cleanup on failure
    try {
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    } catch (_) {}

    return api.sendMessage(
      `❌ API Error\n${err.message}`,
      threadID,
      messageID
    );
  }
};
