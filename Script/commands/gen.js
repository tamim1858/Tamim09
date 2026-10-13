/**
 * gen.js — AI video generation command
 * Author: rX (cleaned & fixed)
 */

const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const config = {
  name: "gen",
  aliases: ["xdis"],
  version: "2.2",
  author: "rX",
  role: 0,
  description: "Generate AI video using your own prompt",
  category: "fun",
  guide:
    "gen -m <prompt> — reply/mention someone, merges both your pics (default if no flag)\n" +
    "gen -s <prompt> — reply/mention someone, uses only their pic (or yours if no target)\n" +
    "gen -i <prompt> — reply to a photo, uses that photo"
};

const __LOCKED_AUTHOR__ = "rX";
const API_BASE = "https://android.getglam.com";

// ---------- Helpers ----------

async function getStreamFromURL(url) {
  const res = await axios.get(url, { responseType: "stream" });
  return res.data;
}

function generateRandomId(len = 16) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

async function getBalance(onId) {
  const uid = generateRandomId();
  try {
    await axios.post(
      `${API_BASE}/v1/user/balance`,
      null,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; SM-A156E) AppleWebKit/537.36",
          "glam-user-id": uid,
          user_id: uid,
          "glam-local-date": new Date().toISOString()
        }
      }
    );
  } catch (_) {}
  if (typeof onId === "function") {
    try { await onId(uid); } catch (_) {}
  }
  return uid;
}

async function uploadFile(userId, fileBuffer, prompt, duration) {
  const form = new FormData();
  form.append("package_id", userId);
  form.append("media_file", fileBuffer, { filename: "media.jpg" });
  form.append("media_type", "20_coimage");
  form.append("template_category", "20_coimage");

  const meta = [
    {
      prompt,
      custom_prompt: prompt,
      start: 0,
      end: 0,
      timings_units: "seconds",
      media_type: "image",
      style_id: "chained_0_0_0_0",
      rate_modifiers: { duration: duration + "s" }
    }
  ];
  form.append("media_meta", JSON.stringify(meta));

  const res = await axios.post(`${API_BASE}/magic/upload`, form, {
    headers: {
      ...form.getHeaders(),
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10; SM-A156E) AppleWebKit/537.36"
    }
  });
  return res.data.event_id;
}

async function getStatus(eventId, userId) {
  while (true) {
    const res = await axios.get(`${API_BASE}/app/v2/event`, {
      params: { package_id: userId, event_id: eventId },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; SM-A156E) AppleWebKit/537.36"
      }
    });
    if (res.data.status === "DONE") return [res.data];
    await new Promise(r => setTimeout(r, 2000));
  }
}

async function imgToVideo(prompt, imgPath, duration = 5, onStart) {
  const uid = await getBalance(onStart);
  const buf = fs.readFileSync(imgPath);
  const eid = await uploadFile(uid, buf, prompt, duration);
  return await getStatus(eid, uid);
}

async function getAvatar(userId) {
  return (
    `https://graph.facebook.com/${userId}/picture` +
    `?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bd92314`
  );
}

async function mergeAvatars(urlA, urlB) {
  const imgA = await loadImage(urlA);
  const imgB = await loadImage(urlB);
  const size = 512;
  const canvas = createCanvas(size * 2, size);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imgA, 0, 0, size, size);
  ctx.drawImage(imgB, size, 0, size, size);

  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  const out = path.join(cacheDir, `merge_${Date.now()}.jpg`);
  fs.writeFileSync(out, canvas.toBuffer("image/jpeg"));
  return out;
}

async function downloadImageToFile(url) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(res.data);
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  const file = path.join(cacheDir, `img_${Date.now()}.jpg`);
  fs.writeFileSync(file, buffer);
  return file;
}

function resolveTargetAndPrompt(event, args) {
  const prompt = args.join(" ").trim();

  if (event.messageReply && event.messageReply.senderID) {
    return { targetID: event.messageReply.senderID, prompt };
  }

  if (event.mentions && Object.keys(event.mentions).length > 0) {
    const ids = Object.keys(event.mentions);
    const first = ids[0];
    let cleaned = prompt;
    for (const id of ids) {
      const name = event.mentions[id];
      if (name) {
        const safe = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        cleaned = cleaned.replace(new RegExp("@?" + safe, "gi"), "");
      }
    }
    cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
    return { targetID: first, prompt: cleaned };
  }

  return { targetID: null, prompt };
}

function getReplyAttachmentImageUrl(event) {
  const rep = event.messageReply;
  if (!rep || !Array.isArray(rep.attachments) || rep.attachments.length === 0)
    return null;
  const img = rep.attachments.find(
    a => a.type === "photo" || a.type === "image"
  );
  if (!img) return null;
  return img.url || img.previewUrl || (img.image && img.image.url) || null;
}

async function safeReact(api, emoji, messageID) {
  if (!api || typeof api.setMessageReaction !== "function") return;
  try {
    await api.setMessageReaction(emoji, messageID);
  } catch (_) {}
}

// ---------- Pipeline ----------

async function runVideoPipeline({
  message, api, commandMessageID, imagePath, prompt, mentionsList
}) {
  const result = await imgToVideo(prompt, imagePath, 5, () =>
    safeReact(api, "🎁", commandMessageID)
  );

  if (!result || !result[0] || !result[0].video_url) {
    throw new Error("Video generation failed");
  }

  await safeReact(api, "✅", commandMessageID);
  await message.reply({
    attachment: await getStreamFromURL(result[0].video_url),
    mentions: mentionsList
  });
}

// ---------- Modes ----------

async function handleMergeMode({ event, message, args, api }) {
  const { targetID, prompt } = resolveTargetAndPrompt(event, args);

  if (!targetID)
    return message.reply(
      "❌ Reply to someone's message or mention them to merge.\n" +
        "Example: gen -m dancing together (reply)\n" +
        "Example: gen @John dancing together"
    );

  if (!prompt)
    return message.reply(
      "❌ Prompt missing.\nExample: gen -m dancing together"
    );

  const selfID = event.senderID;
  if (selfID === targetID)
    return message.reply("❌ You cannot merge with yourself.");

  let tmpFile = null;
  const cmdMsgID = event.messageID;
  await safeReact(api, "⌛", cmdMsgID);

  try {
    const me = await getAvatar(selfID);
    const other = await getAvatar(targetID);
    tmpFile = await mergeAvatars(me, other);

    await runVideoPipeline({
      message,
      api,
      commandMessageID: cmdMsgID,
      imagePath: tmpFile,
      prompt,
      mentionsList: [
        { tag: "you", id: selfID },
        { tag: "them", id: targetID }
      ]
    });
  } catch (e) {
    console.error("MERGE ERROR:", e);
    await safeReact(api, "❌", cmdMsgID);
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch (_) {}
    }
  }
}

async function handleSingleMode({ event, message, args, api }) {
  const { targetID, prompt } = resolveTargetAndPrompt(event, args);

  if (!prompt)
    return message.reply(
      "❌ Prompt missing.\nExample: gen -s dancing (reply)\n" +
        "Example: gen -s @John dancing"
    );

  const selfID = event.senderID;
  const useID = targetID || selfID;

  let tmpFile = null;
  const cmdMsgID = event.messageID;
  await safeReact(api, "⌛", cmdMsgID);

  try {
    const avatar = await getAvatar(useID);
    tmpFile = await downloadImageToFile(avatar);

    const mentions =
      useID === selfID
        ? [{ tag: "you", id: selfID }]
        : [{ tag: "them", id: useID }];

    await runVideoPipeline({
      message,
      api,
      commandMessageID: cmdMsgID,
      imagePath: tmpFile,
      prompt,
      mentionsList: mentions
    });
  } catch (e) {
    console.error("SINGLE ERROR:", e);
    await safeReact(api, "❌", cmdMsgID);
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch (_) {}
    }
  }
}

async function handleImageMode({ event, message, args, api }) {
  const prompt = args.join(" ").trim();

  if (!prompt)
    return message.reply(
      "❌ Prompt missing.\nExample: gen -i dancing in rain (reply to a photo)"
    );

  const imgUrl = getReplyAttachmentImageUrl(event);
  if (!imgUrl)
    return message.reply("❌ Reply to a photo.");

  const senderID = event.senderID;
  let tmpFile = null;
  const cmdMsgID = event.messageID;
  await safeReact(api, "⌛", cmdMsgID);

  try {
    tmpFile = await downloadImageToFile(imgUrl);
    await runVideoPipeline({
      message,
      api,
      commandMessageID: cmdMsgID,
      imagePath: tmpFile,
      prompt,
      mentionsList: [{ tag: "you", id: senderID }]
    });
  } catch (e) {
    console.error("IMAGE ERROR:", e);
    await safeReact(api, "❌", cmdMsgID);
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch (_) {}
    }
  }
}

// ---------- Entry ----------

async function onStart({ event, message, usersData, args, api }) {
  const flag = args[0];

  if (flag === "-s")
    return handleSingleMode({ event, message, args: args.slice(1), api });

  if (flag === "-i")
    return handleImageMode({ event, message, args: args.slice(1), api });

  const rest = flag === "-m" ? args.slice(1) : args;
  return handleMergeMode({ event, message, args: rest, api });
}

module.exports = { config, onStart };
