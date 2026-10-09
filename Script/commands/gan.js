const axios = require("axios");

const songs = [
  "https://files.catbox.moe/etsdn9.mp3",
  "https://files.catbox.moe/ayepdz.mp3",
  "https://files.catbox.moe/oaecnx.mp3",
  "https://files.catbox.moe/xtpf61.mp3",
  "https://files.catbox.moe/12grz0.mp3",
  "https://files.catbox.moe/aaqddo.mp3",
  "https://files.catbox.moe/k3acvx.mp3",
  "https://files.catbox.moe/nry1qv.mp3",
  "https://files.catbox.moe/23e8u1.mp3",
  "https://files.catbox.moe/y8dzik.mp3",
  "https://files.catbox.moe/z9d2e6.mp3",
  "https://files.catbox.moe/0xscc8.mp3",
  "https://files.catbox.moe/q4m2ad.mp3",
  "https://files.catbox.moe/y8bg4r.mp3",
  "https://files.catbox.moe/q61co1.mp3",
  "https://files.catbox.moe/euq7fo.mp3",
  "https://files.catbox.moe/x5f56o.mp3",
  "https://files.catbox.moe/avlqok.mp3",
  "https://files.catbox.moe/v0twt3.mp3",
  "https://files.catbox.moe/qmpvpt.mp3"
];

module.exports = {
  config: {
    name: "gan",
    version: "1.0.3",
    role: 0,
    author: "Shakibul",
    shortDescription: "Play random song 🎵",
    longDescription: "Sends a random song from the URL list.",
    category: "music",
    guide: "{p}gan"
  },

  onStart: async function ({ api, event }) {
    try {
      const url = songs[Math.floor(Math.random() * songs.length)];

      const response = await axios.get(url, {
        responseType: "stream"
      });

      return api.sendMessage(
        {
          body: "🎵 Random Song\nEnjoy the music! 🎧",
          attachment: response.data
        },
        event.threadID,
        event.messageID
      );

    } catch (error) {
      console.error("GAN ERROR:", error);

      return api.sendMessage(
        "❌ গান পাঠাতে সমস্যা হয়েছে।",
        event.threadID,
        event.messageID
      );
    }
  }
};
