const axios = require("axios");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "bonk",
    aliases: ["b"],
    author: "Meheraz | rewrite by Muzan | Sticker Edition",
    shortDescription: "Bonk someone (sticker)",
    longDescription: "Make a BONK meme sticker using two avatars",
    category: "sticker",
  },

  // বৃত্তাকার (circular) ক্রপ করার হেল্পার
  circleCrop: async function (buffer, size) {
    // বৃত্তাকার মাস্ক SVG
    const circleSvg = Buffer.from(
      `<svg width="${size}" height="${size}">
         <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/>
       </svg>`
    );

    const resized = await sharp(buffer)
      .resize(size, size, { fit: "cover" })
      .composite([{ input: circleSvg, blend: "dest-in" }])
      .png()
      .toBuffer();

    return resized;
  },

  makeSticker: async function (one, two) {
    const bgURL = "https://i.postimg.cc/KYJ0VnK0/image0.png";
    const bgRes = await axios.get(bgURL, { responseType: "arraybuffer" });
    const bgBuffer = Buffer.from(bgRes.data);

    const width = 512;
    const height = 512;

    // Facebook প্রোফাইল ছবি আনার ফাংশন
    const fetchPfp = async (id) => {
      const url = `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const res = await axios.get(url, { responseType: "arraybuffer" });
      return Buffer.from(res.data);
    };

    const avtOne = await fetchPfp(one);
    const avtTwo = await fetchPfp(two);

    const circle1 = await this.circleCrop(avtOne, 110); // Sender
    const circle2 = await this.circleCrop(avtTwo, 90);  // Target

    // ব্যাকগ্রাউন্ড রিসাইজ
    const bgResized = await sharp(bgBuffer)
      .resize(width, height)
      .png()
      .toBuffer();

    // কম্পোজিট লেয়ার — position গুলো স্কেল করা হয়েছে 512x512 এর জন্য
    const composed = await sharp(bgResized)
      .composite([
        { input: circle1, top: 160, left: 50 },  // sender hitting position
        { input: circle2, top: 230, left: 400 }, // target bonked position
      ])
      .webp({ quality: 90 })
      .toBuffer();

    const outPath = path.join(__dirname, `bonk_${one}_${two}.webp`);
    fs.writeFileSync(outPath, composed);
    return outPath;
  },

  onStart: async function ({ api, event, args }) {
    try {
      const { threadID, messageID, senderID, mentions, messageReply } = event;

      let targetID;
      if (messageReply?.senderID) targetID = messageReply.senderID;
      else if (mentions && Object.keys(mentions).length) targetID = Object.keys(mentions)[0];
      else if (args[0] && /^\d+$/.test(args[0])) targetID = args[0];
      else return api.sendMessage("⚠ Reply / Mention / UID use koro.", threadID, messageID);

      const one = senderID;
      const two = targetID;

      // টার্গেটের নাম বের করা
      let targetName = "User";
      try {
        const userInfo = await api.getUserInfo(targetID);
        if (userInfo && userInfo[targetID] && userInfo[targetID].name) {
          targetName = userInfo[targetID].name;
        }
      } catch (e) {
        if (mentions && mentions[targetID]) {
          targetName = mentions[targetID].replace("@", "");
        }
      }

      const file = await this.makeSticker(one, two);

      api.sendMessage(
        {
          body: `${targetName} bonk nigga 🪓`,
          attachment: fs.createReadStream(file),
        },
        threadID,
        () => {
          try { fs.unlinkSync(file); } catch (e) {}
        },
        messageID
      );
    } catch (err) {
      api.sendMessage("❌ Error: " + err.message, event.threadID, event.messageID);
    }
  },
};
