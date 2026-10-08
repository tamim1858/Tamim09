const axios = require("axios");
const fs = require("fs");
const request = require("request");

const link = [
  "https://i.imgur.com/VTMDDv6.mp4",
  "https://i.imgur.com/GErxTCo.mp4",
  "https://i.imgur.com/1ocMyCc.mp4",
  "https://i.imgur.com/N0ndewv.mp4",
  "https://i.imgur.com/FGu1yMW.mp4",
  "https://i.imgur.com/ZIQdoGE.mp4",
  "https://i.imgur.com/DyvLM8q.mp4",
  "https://i.imgur.com/2h8mf17.mp4C"
];

module.exports.config = {
  name: "💔",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "RX Abdullah",
  description: "auto reply to 💔 with text and video",
  commandCategory: "noprefix",
  usages: "💔",
  cooldowns: 5,
  dependencies: {
    "request": "",
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.handleEvent = async ({ api, event, Threads }) => {
  const content = event.body ? event.body : '';
  const body = content.toLowerCase();

  // Check if feature is enabled
  let data = (await Threads.getData(event.threadID)).data || {};
  if (data["💔"] === false) return;

  if (body.startsWith("💔")) {
    const texts = [
      "╭•┄┅════❁🌺❁════┅┄•╮\n⎯꯭𓆩꯭𝆺𝅥😻⃞𝐌⃞𝆠፝֟𝐑᭄ღ 𝐓⃞𝐀⃞𝐌⃞𝐈⃞𝐌༢࿐\n╰•┄┅════❁🌺❁════┅┄•╯",
      "╭•┄┅════❁🎀❁════┅┄•╮\n⎯꯭𓆩꯭𝆺𝅥😻⃞𝐌⃞𝆠፝֟𝐑᭄ღ 𝐓⃞𝐀⃞𝐌⃞𝐈⃞𝐌༢࿐\n╰•┄┅════❁🎀❁════┅┄•╯"
    ];

    const randomText = texts[Math.floor(Math.random() * texts.length)];
    const randomVideo = link[Math.floor(Math.random() * link.length)];
    const filePath = __dirname + "/cache/💔.mp4";

    const callback = () => api.sendMessage({
      body: randomText,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);

    const requestStream = request(encodeURI(randomVideo));
    requestStream.pipe(fs.createWriteStream(filePath)).on("close", callback);
  }
};

module.exports.languages = {
  "vi": {
    "on": "Đã bật phản hồi 💔",
    "off": "Đã tắt phản hồi 💔",
    "successText": `🧠`,
  },
  "en": {
    "on": "💔 auto-reply is ON",
    "off": "💔 auto-reply is OFF",
    "successText": "✅",
  }
};

module.exports.run = async ({ api, event, Threads, getText }) => {
  const { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data || {};

  // Toggle the 💔 feature
  data["💔"] = !data["💔"];

  await Threads.setData(threadID, { data });
  global.data.threadData.set(threadID, data);

  api.sendMessage(
    `${data["💔"] ? getText("on") : getText("off")} ${getText("successText")}`,
    threadID,
    messageID
  );
};
