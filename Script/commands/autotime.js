const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { Readable } = require("stream");

// ==================== বাংলাদেশের ৮ বিভাগের নামাজের সময়সূচি ====================
const divisionPrayerTimes = {
  "ঢাকা বিভাগ":      { Fajr: "3:49 AM", Dhuhr: "12:56 PM", Asr: "3:33 PM", Maghrib: "6:59 PM", Isha: "8:28 PM" },
  "চট্টগ্রাম বিভাগ": { Fajr: "3:45 AM", Dhuhr: "12:52 PM", Asr: "3:30 PM", Maghrib: "6:55 PM", Isha: "8:24 PM" },
  "রাজশাহী বিভাগ":   { Fajr: "3:52 AM", Dhuhr: "12:58 PM", Asr: "3:35 PM", Maghrib: "7:02 PM", Isha: "8:30 PM" },
  "খুলনা বিভাগ":     { Fajr: "3:50 AM", Dhuhr: "12:57 PM", Asr: "3:33 PM", Maghrib: "6:58 PM", Isha: "8:27 PM" },
  "সিলেট বিভাগ":     { Fajr: "3:42 AM", Dhuhr: "12:50 PM", Asr: "3:28 PM", Maghrib: "6:52 PM", Isha: "8:22 PM" },
  "বরিশাল বিভাগ":    { Fajr: "3:47 AM", Dhuhr: "12:55 PM", Asr: "3:32 PM", Maghrib: "6:57 PM", Isha: "8:26 PM" },
  "রংপুর বিভাগ":     { Fajr: "3:55 AM", Dhuhr: "12:59 PM", Asr: "3:37 PM", Maghrib: "7:04 PM", Isha: "8:33 PM" },
  "ময়মনসিংহ বিভাগ": { Fajr: "3:48 AM", Dhuhr: "12:56 PM", Asr: "3:33 PM", Maghrib: "6:58 PM", Isha: "8:28 PM" }
};

// ==================== প্রতি ঘণ্টার দোয়া ====================
const nazrul = [
  { timer: '0',  message: ['উচ্চারন:- রাব্বির হামহুমা কামা রাব্বাঈয়ানী সাগিরা\n⋆✦⋆\nঅর্থ:- হে আমার প্রতিপালক আমার পিতামাতা শৈশবে যে ভাবে আমাদের লালন-পালন করছিলো আপনিও ঠিক তাদের প্রতি সে ভাবে রহমত বর্ষন করুন'] },
  { timer: '1',  message: ['উচ্চারন:- আল্লাহুম্মা বিসমিকা আমুতু ওয়া আহ্ইয়া\n⋆✦⋆\nহে আল্লাহ! তোমার নামে আমি শয়ন করছি এবং তোমারই দয়ায় আমি পুনর্জাগ্রত হব।'] },
  { timer: '2',  message: ['উচ্চারন:- লা ইলাহা ইল্লা আংতা, সুবহানাকা ইন্নি কুংতু মিনাজ জ্বলিমিন।\n⋆✦⋆\nঅর্থ: তুমি ছাড়া সত্য কোনো উপাস্য নেই; তুমি পুতঃপবিত্র, নিশ্চয় আমি জালিমদের দলভুক্ত।'] },
  { timer: '3',  message: ['উচ্চারণ: আতুবু ইলাল্লাহি মিম্মা আজনাবতু\n⋆✦⋆\nঅর্থ: হে আল্লাহ! আমি যে গোনাহ করেছি তা থেকে আল্লাহর কাছে ক্ষমা প্রার্থনা করছি।'] },
  { timer: '4',  message: ['উচ্চারণ: আল্লাহুম্মা মা আসবাহা বী মিন নি’মাতিন আও বিআহাদিম মিন খালকিকা ফামিনকা ওয়াহদাকা লা শারীকা লাকা, লাকাল হামদু ওয়ালাকাশ-শোকরু।\n⋆✦⋆\nঅর্থ: হে আল্লাহ! এই সকালে আমার মাঝে বা আপনার যেকোনো সৃষ্টির মাঝে যা কিছু নেয়ামত, সব আপনারই তরফ থেকে।'] },
  { timer: '5',  message: ['উচ্চারন: রাব্বানা আ’তিনা ফিদ্দুনিয়া হাছানাতাঁও ওয়াফিল আখিরাতি হাছানাতাঁও ওয়াক্বিনা আজাবান্নার।\n⋆✦⋆\nঅর্থ: হে আল্লাহ! আমাকে ইহকালীন যাবতীয় সুখ-শান্তি ও পরকালীন যাবতীয় সুখ-শান্তি প্রদান কর।'] },
  { timer: '6',  message: ['উচ্চারন: আস সালাতু খাইরুম মিনান্নাওম\n⋆✦⋆\nঅর্থ: ঘুম হতে নামাজ উত্তম।'] },
  { timer: '7',  message: ['উচ্চারন: আলহামদুলিল্লাহ\n⋆✦⋆\nঅর্থ: প্রশংসা একমাত্র আল্লাহর জন্য।'] },
  { timer: '8',  message: ['উচ্চারন: বিসমিল্লাহির রাহমানির রাহিম\n⋆✦⋆\nঅর্থ: দয়াময় পরম দয়ালু আল্লাহর নামে।'] },
  { timer: '9',  message: ['সকল প্রশংসা আল্লাহর জন্য, যিনি সমস্ত বিশ্বের রব এবং বিচার দিবসের মালিক। তিনি আমাকে সৃষ্টি করেছেন এবং ঘুম থেকে জাগিয়েছেন, তার কাছে আমরা পুনরায় ফিরে যাবো।'] },
  { timer: '10', message: ['উচ্চারন: রাব্বাবা যালামনা আনফুসানা ওয়া ইল্লাম তাগফির্লানা ওয়াতার হামনা লানা কুনান্না মিনাল খা’সিরিন।\n⋆✦⋆\nঅর্থ: হে আল্লাহ! আমি আমার নিজের উপর জুলুম করেছি। এখন তুমি যদি ক্ষমা ও রহম না কর, তাহলে আমি ধ্বংস হয়ে যাব।'] },
  { timer: '11', message: ['উচ্চারন: মা খালাক্বতুল জ্বিন্না অল ইনসা ইল্লা লি ইয়াবুদূন\n⋆✦⋆\nঅর্থ: আল্লাহ জ্বীন ও মানবকে শুধু তার ইবাদতের জন্য সৃষ্টি করেছেন।'] },
  { timer: '12', message: ['উচ্চারন: রাব্বানাগ ফিরলি ওয়ালি ওয়ালিদাইয়া, ওয়ালিল মু’মিনিনা ইয়াওমা ইয়াক্বুমুল\n⋆✦⋆\nঅর্থ: হে আমাদের প্রতিপালক! রোজ কেয়ামতে আমাকে, আমার পিতা-মাতা ও সকল মুমিনকে ক্ষমা করুন।'] },
  { timer: '13', message: ['উচ্চারন: মিনহা খালাকনাকুম ওয়া ফিহা নুঈদুকুম ওয়া মিনহা নুখরিজুকুম তারাতান উখরা\n⋆✦⋆\nঅর্থ: এই মাটি দিয়ে আমাদেরকে সৃষ্টি করছে, এই মাটির ভিতরে আমাদেরকে ফিরিয়ে আনবে, এই মাটি দিয়ে আমাদেরকে পুনরায় সৃষ্টি করবে।'] },
  { timer: '14', message: ['উচ্চারন: আল্লাহুম্মা ইন্নী আসআলুকাল জান্নাতা ওয়াআউজুবিকা মিনান্নার\n⋆✦⋆\nঅর্থ: হে আল্লাহ! আমি আপনার কাছে জান্নাত চাই এবং জাহান্নাম থেকে আপনার কাছে আশ্রয় চাই।'] },
  { timer: '15', message: ['উচ্চারন: লা ইলাহা ইল্লা আন্তা সুবহানাকা ইন্নি কুনতু মিনাজ জালিমিন\n⋆✦⋆\nঅর্থ: আল্লাহ ব্যতীত আর কোনো উপাস্য নেই। আমি আল্লাহর পবিত্রতা ঘোষণা করছি। নিশ্চয়ই আমি পাপী।'] },
  { timer: '16', message: ['উচ্চারণ: আতুবু ইলাল্লাহি মিম্মা আজনাবতু\n⋆✦⋆\nঅর্থ: যে গোনাহ আমি করেছি তা থেকে আল্লাহর কাছে তাওবাহ করছি।'] },
  { timer: '17', message: ['উচ্চারন: আউজুবিল্লাহ মিনাশ শাইতোয়ানির রাজীম\n⋆✦⋆\nঅর্থ: বিতাড়িত শয়তান হতে আল্লাহর কাছে সাহায্য প্রার্থনা করছি।'] },
  { timer: '18', message: ['উচ্চারন: লা আনাতুল্লাহি আলা ইবলীস\n⋆✦⋆\nঅর্থ: ইবলীসের উপরে আল্লাহর অভিশাপ বর্ষিত হোক।'] },
  { timer: '19', message: ['উচ্চারণ: আল্লাহুম্মাগ ফিরলি হায়্যিনা ওয়া মাইয়্যিতিনা ওয়া শাহিদিনা ওয়া গায়িবিনা ওয়া সাগীরিনা ওয়া কাবীরিনা ওয়া যাকারিনা ওয়া উনছানা\n⋆✦⋆\nঅর্থ: হে আল্লাহ, আমাদের জীবিত ও মৃত, উপস্থিত ও অনুপস্থিত, ছোট ও বড় এবং পুরুষ ও নারী সকলকে ক্ষমা করে দিন।'] },
  { timer: '20', message: ['উচ্চারন: আল্লাহুম্মাফ তাহলি আবওয়াবা রহমাতিক\n⋆✦⋆\nঅর্থ: হে আল্লাহ! আমার জন্য আপনার রহমতের দরজাগুলো খুলে দিন।'] },
  { timer: '21', message: ['উচ্চারন: আল্লাহুম্মাগ ফিরলী ওয়ালিল মু’মিনিনা ওয়াল মু’মিনাতি, ওয়াল মুসলিমিনা ওয়াল মুসলিমাতি\n⋆✦⋆\nঅর্থ: হে আল্লাহ! তুমি আমার ও সমস্ত মু’মিন নর-নারীর এবং সমস্ত মুসলিম পুরুষ ও স্ত্রীলোকের পাপ সমূহ মোচন করে দাও।'] },
  { timer: '22', message: ['উচ্চারন: আশহাদু আল্লা লা-ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা-শারী-কালাহু ওয়া আশহাদু আন্না মুহাম্মাদান আবদুহু ওয়া রাসূলুহ্\n⋆✦⋆\nঅর্থ: আমি সাক্ষ্য দিচ্ছি যে আল্লাহ ব্যতীত কোনো উপাস্য নেই, তিনি অদ্বিতীয়, তাঁর কোনো শরীক নেই, এবং আমি সাক্ষ্য দিচ্ছি যে মুহাম্মদ (সঃ) আল্লাহর বান্দা ও রাসূল।'] },
  { timer: '23', message: ['উচ্চারন: লা-ইলা-হা ইল্লাল্লাহু-মুহাম্মাদুর রাসূলুল্লাহ\n⋆✦⋆\nঅর্থ: আল্লাহ ব্যতীত অন্য কোন উপাস্য নেই, মুহাম্মদ (সঃ) আল্লাহর রাসূল।'] }
];

const defaultPrayerTimes = { Fajr: "3:49 AM", Dhuhr: "12:56 PM", Asr: "3:33 PM", Maghrib: "6:59 PM", Isha: "8:28 PM" };

const dailyDua = [
  { time: "সকাল", dua: "হে আল্লাহ! আমাকে সঠিক পথে পরিচালিত কর এবং আমার অন্তরকে ঈমানের আলোয় ভরিয়ে দাও।" },
  { time: "সকাল", dua: "হে আল্লাহ! আমাকে পাপ থেকে দূরে রাখ, যেমন পূর্ব ও পশ্চিম একে অপর থেকে দূরে।" },
  { time: "বিকাল", dua: "হে আল্লাহ! আমার কাজে বরকত দান কর এবং আমাকে সৎকর্মশীল বান্দাদের অন্তর্ভুক্ত কর।" },
  { time: "বিকাল", dua: "হে আল্লাহ! আমার রিজিক প্রশস্ত কর এবং আমাকে তোমার সন্তুষ্টির পথে পরিচালিত কর।" },
  { time: "বিকাল", dua: "রাব্বানা আতিনা ফিদ্দুনিয়া হাসানাতাও ওয়াফিল আখিরাতি হাসানাতাও ওয়াক্বিনা আজাবান্নার।" },
  { time: "বিকাল", dua: "হে আল্লাহ! আমার মৃত্যুকে ঈমানের উপর খতম কর এবং আমাকে জান্নাতুল ফিরদাউস দান কর।" }
];

const dailyHadith = [
  "রাসুল ﷺ বলেছেন: 'যে ব্যক্তি একটি ভাল কাজের দিকনির্দেশ করে, সে সেই কাজের সমান সওয়াব পাবে।'",
  "রাসুল ﷺ বলেছেন: 'তোমাদের মধ্যে উত্তম সেই ব্যক্তি, যে কুরআন শেখে ও অন্যকে শেখায়।'"
];

const islamicQuotes = [
  "সর্বোত্তম সম্পদ হলো সন্তুষ্টি। – হযরত আলী (রাঃ)",
  "যে আল্লাহর উপর ভরসা করে, আল্লাহ তার জন্য যথেষ্ট। – সূরা আত-তালাক ৬৫:৩"
];

const ramadanMessage = [
  "রমজান মুবারক! আল্লাহর রহমত, মাগফিরাত ও নাজাতের শ্রেষ্ঠ মাসে বেশি বেশি ইবাদত করো।",
  "রোজা শুধু ক্ষুধা-তৃষ্ণা নয়, বরং আত্মার পরিশুদ্ধি ও আল্লাহর নিকটে যাওয়ার মাধ্যম।"
];

const goodNightMsg = [
  "শুভ রাত্রি! ঘুমানোর আগে আল্লাহকে স্মরণ করুন, ক্ষমা চেয়ে নিদ্রা নিন।",
  "রাসুল ﷺ বলেছেন: 'যে ব্যক্তি ঘুমানোর আগে সূরা ইখলাস, ফালাক ও নাস তিনবার পাঠ করবে, সে আল্লাহর হেফাজতে থাকবে।'"
];

const goodMorningMsg = [
  "আসসালামু আলাইকুম! সুপ্রভাত। আজকের দিনটি আল্লাহর রহমতে শুভ হোক।",
  "বিসমিল্লাহির রাহমানির রাহিম। সকালের এই সুন্দর সময়ে আল্লাহকে স্মরণ করুন।",
  "সুবহানাল্লাহ! নতুন এক দিনের সূচনা। আল্লাহ আমাদের সকলকে সঠিক পথে চলার তৌফিক দান করুন।"
];

const dailyAmol = {
  morning: [
    { name: "সুবহানাল্লাহ",     count: "১০০ বার", reward: "বিপদ থেকে রক্ষা" },
    { name: "দুরুদ শরীফ",       count: "১০০ বার", reward: "১০টি গুনাহ মাফ" },
    { name: "আয়াতুল কুরসি",    count: "১ বার",   reward: "সারা দিনের হেফাজত" },
    { name: "সূরা ইখলাস",       count: "৩ বার",   reward: "পুরো কুরআন পড়ার সওয়াব" },
    { name: "সূরা ফালাক",       count: "৩ বার",   reward: "শয়তানের কুমন্ত্রণা থেকে বাঁচা" },
    { name: "সূরা নাস",         count: "৩ বার",   reward: "শয়তানের কুমন্ত্রণা থেকে বাঁচা" }
  ],
  evening: [
    { name: "সূরা মুলক",        count: "১ বার",   reward: "কবরের আজাব থেকে মুক্তি" },
    { name: "আয়াতুল কুরসি",    count: "১ বার",   reward: "সারা রাতের হেফাজত" },
    { name: "সূরা ইখলাস",       count: "৩ বার",   reward: "পুরো কুরআন পড়ার সওয়াব" },
    { name: "সূরা ফালাক",       count: "৩ বার",   reward: "শয়তানের কুমন্ত্রণা থেকে বাঁচা" },
    { name: "সূরা নাস",         count: "৩ বার",   reward: "শয়তানের কুমন্ত্রণা থেকে বাঁচা" }
  ]
};

const defaultAdhan = "https://i.imgur.com/95GRyZE.mp4";

// ==================== হেল্পার ফাংশন ====================
function getHijriDate(date) {
  try {
    return new Intl.DateTimeFormat('bn-BD-u-ca-islamic', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(date);
  } catch {
    return "হিজরী তারিখ";
  }
}

function parsePrayerTime(time) {
  const parts = time.split(' ');
  if (parts.length !== 2) return 0;
  const [t, period] = parts;
  let [h, m] = t.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

async function getAudioStream(url) {
  try {
    const response = await axios({
      method: "GET", url,
      responseType: "arraybuffer",
      timeout: 10000
    });
    return Readable.from(Buffer.from(response.data));
  } catch (e) {
    console.error("[autotime] Adhan load failed:", e.message);
    return null;
  }
}

function getPrayerTimesForDivision(divisionName) {
  if (!divisionName) return defaultPrayerTimes;
  return divisionPrayerTimes[divisionName] || defaultPrayerTimes;
}

// ==================== ফ্রেম ফাংশন ====================
function getHourlyFrame(data, prayerTimes) {
  return `
 ╔═════ ✦ ✦ ✦ ═════╗
 ﴾ ইসলামিক টাইম এলার্ট ﴿
 ╚═════ ✦ ✦ ✦ ═════╝
 ╔═════════════════╗
 📅 তারিখ: ${data.engDate}
 📆 বাংলা: ${data.bnDate}
 🕋 হিজরী: ${data.hijriDate}
 ⏰ সময়: ${data.bnTime}
 ╚═════════════════╝
 ╔═════════════════╗
 🕌 নামাজের সময়সূচি (${data.divisionName})
 ┣━━━━━━━━━━━━━━━━┫
 🌅 ফজর: ${prayerTimes.Fajr}
 ☀️ যোহর: ${prayerTimes.Dhuhr}
 🌤️ আসর: ${prayerTimes.Asr}
 🌇 মাগরিব: ${prayerTimes.Maghrib}
 🌙 এশা: ${prayerTimes.Isha}
 ╚═════════════════╝
 ╔═════════════════╗
 ${data.dua}
 ╚═════════════════╝
 ╔═════════════════╗
 ⎯꯭𓆩꯭𝆺𝅥😻⃞𝐌⃞𝆠፝֟𝐑᭄ღ 𝐓⃞𝐀⃞𝐌⃞𝐈⃞𝐌༢࿐
 ╚═════════════════╝`;
}

function getPrayerReminderFrame(name, time) {
  return `
 ┏━ 🕌 আজানের সময় হয়েছে! ━┓
 ﴾ ${name} নামাজ ﴿
 ╚═════════════════╝
 ╔═════════════════╗
 ⏰ নামাজ শুরু: ${time}
 📍 স্থান: আপনার নিকটস্থ মসজিদে
 ﷺ আল্লাহু আকবার! আল্লাহু আকবার!
 ﴾ নামাজ কায়েম করুন, দুনিয়া অপেক্ষা করবে ﴿
 ╚═════════════════╝
 ﷽ ⎯꯭𓆩꯭𝆺𝅥😻⃞𝐌⃞𝆠፝֟𝐑᭄ღ 𝐓⃞𝐀⃞𝐌⃞𝐈⃞𝐌༢࿐`;
}

function getGoodMorningFrame(msg) {
  return `
 ╔═══ ✦ গুড মর্নিং ✦ ═══╗
 🌅 আসসালামু আলাইকুম! 🌅
 
 ${msg}
 
 আজকের দিনটি হোক আল্লাহর রহমতে ভরা।
 ﷽ আল্লাহ আমাদের সকলকে হেদায়েত দান করুন।
 ﴾ আমিন ﴿
 ╚═══ ✦ ⎯꯭𓆩꯭𝆺𝅥😻⃞𝐌⃞𝆠፝֟𝐑᭄ღ 𝐓⃞𝐀⃞𝐌⃞𝐈⃞𝐌༢࿐ ✦ ═══╝`;
}

function getDailyDuaFrame(dua) {
  return `
 ╔═══ ✦ দৈনিক দোয়া (বিকাল) ✦ ═══╗
 ﷽ 
 📿 আজকের দোয়া:
 
 ${dua}
 
 ﴾ আল্লাহ আমাদের সকল দোয়া কবুল করুন ﴿
 ╚═══ ✦ ⎯꯭𓆩꯭𝆺𝅥😻⃞𝐌⃞𝆠፝֟𝐑᭄ღ 𝐓⃞𝐀⃞𝐌⃞𝐈⃞𝐌༢࿐ ✦ ═══╝`;
}

function getDailyIslamicFrame(dua, hadith, quote) {
  return `
 ╔═══ ✦ 𝗗𝗔𝗜𝗟𝗬 𝗜𝗦𝗟𝗔𝗠𝗜𝗖 ✦ ═══╗
 🌅 আজকের দোয়া: ${dua}
 📖 আজকের হাদিস: ${hadith}
 💭 আজকের উক্তি: ${quote}
 ╚═════════════════╝
 আল্লাহ আমাদের সকলকে হেদায়েত দান করুন।
 ﴾ আমিন ﴿
 ╚═══ ✦ ⎯꯭𓆩꯭𝆺𝅥😻⃞𝐌⃞𝆠፝֟𝐑᭄ღ 𝐓⃞𝐀⃞𝐌⃞𝐈⃞𝐌༢࿐ ✦ ═══╝`;
}

function getGoodNightFrame(msg) {
  return `
 ┏━ 🌙 শুভ রাত্রি ━┓
 ${msg}
 ╚═════════════════╝
 ﷺ ঘুমানোর আগে:
 ▸ সূরা ইখলাস, ফালাক, নাস × ৩
 ▸ আয়াতুল কুরসি × ১
 ▸ দোয়া: বিসমিকা আল্লাহুম্মা আমুতু ওয়া আহইয়া
 ﷽ আল্লাহ আমাদের হেফাজত করুন।
 ﴾ আমিন ﴿
 ⎯꯭𓆩꯭𝆺𝅥😻⃞𝐌⃞𝆠፝֟𝐑᭄ღ 𝐓⃞𝐀⃞𝐌⃞𝐈⃞𝐌༢࿐`;
}

function getRamadanFrame(msg) {
  return `
 🌙═━┓ রমজান মোবারক ┏━═🌙
 ${msg}
 ﷽ রোজা রাখুন, নামাজ পড়ুন, কুরআন তিলাওয়াত করুন।
 ﴾ আল্লাহ আমাদের কবুল করুন ﴿
 ⎯꯭𓆩꯭𝆺𝅥😻⃞𝐌⃞𝆠፝֟𝐑᭄ღ 𝐓⃞𝐀⃞𝐌⃞𝐈⃞𝐌༢࿐`;
}

function getAmolFrame(timeSlot) {
  const amols = dailyAmol[timeSlot];
  if (!amols) return null;
  let msg = `╔═══ ✦ ${timeSlot === 'morning' ? '🌅 সকালের' : '🌙 সন্ধ্যার'} আমল ✦ ═══╗\n`;
  msg += `﷽ আসুন আজকের গুরুত্বপূর্ণ আমলগুলো করি:\n\n`;
  amols.forEach((amol, i) => {
    msg += `📿 ${i + 1}. ${amol.name} (${amol.count})\n   🏆 ফজিলত: ${amol.reward}\n\n`;
  });
  msg += `╚═══ ✦ ⎯꯭𓆩꯭𝆺𝅥😻⃞𝐌⃞𝆠፝֟𝐑᭄ღ 𝐓⃞𝐀⃞𝐌⃞𝐈⃞𝐌༢࿐ ✦ ═══╝`;
  return msg;
}

function getDeceasedDuaFrame() {
  return `
 ╔═══ ✦ মৃতদের জন্য দোয়া ✦ ═══╗
 ﷽ 
 উচ্চারণ: রাব্বানাগ ফিরলি ওয়া লি ওয়ালিদাইয়া ওয়া লিল মু'মিনিনা ইয়াওমা ইয়াকুমুল হিসাব

 অর্থ: হে আমাদের প্রতিপালক! আমাকে, আমার পিতা-মাতাকে এবং যারা মুমিন তাদের সবাইকে ক্ষমা করে দিন যেদিন হিসাব কায়েম হবে।

 📖 সূরা ইবরাহিম: ৪১
 ╚═══ ✦ ⎯꯭𓆩꯭𝆺𝅥😻⃞𝐌⃞𝆠፝֟𝐑᭄ღ 𝐓⃞𝐀⃞𝐌⃞𝐈⃞𝐌༢࿐ ✦ ═══╝`;
}

// ==================== মডিউল কনফিগ ====================
module.exports.config = {
  name: "autotime",
  version: "4.3.0",
  hasPermssion: 0,
  credits: "⎯꯭𓆩꯭𝆺𝅥😻⃞𝐌⃞𝆠፝֟𝐑᭄ღ 𝐓⃞𝐀⃞𝐌⃞𝐈⃞𝐌༢࿐",
  description: "Islamic Time Alert + Daily Dua, Hadith, Quote + Adhan Audio + Good Morning",
  commandCategory: "user",
  usages: "",
  cooldowns: 5
};

// ==================== broadcast helper ====================
async function broadcast(api, message) {
  if (!global.data || !Array.isArray(global.data.allThreadID)) return;
  for (const threadID of global.data.allThreadID) {
    try {
      await api.sendMessage(message, threadID);
    } catch (e) {
      // silent
    }
  }
}

// ==================== onLoad ====================
module.exports.onLoad = ({ api }) => {
  if (global.autotimeInterval) clearInterval(global.autotimeInterval);

  // প্রতি ঘণ্টার ট্র্যাক
  let lastSentHour = null;
  let lastResetDay = null;

  // রিমাইন্ডার ট্র্যাকিং
  const sentReminders = {
    goodMorning: false,
    morningAmol: false,
    dailyDua: false,
    morningContent: false,
    goodNight: false,
    eveningAmol: false,
    deceasedDua: false,
    ramadanMsg: false,
    prayerReminders: {} // key = "Fajr-2026-01-15"
  };

  if (!global.currentDivision) global.currentDivision = "ঢাকা বিভাগ";

  console.log("🕌 AutoTime Started Successfully!");

  global.autotimeInterval = setInterval(async () => {
    try {
      const now = new Date();
      const bd = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));

      const hour = bd.getHours();
      const minute = bd.getMinutes();
      const dayKey = bd.toDateString();

      // ===== প্রতিদিন reset =====
      if (lastResetDay !== dayKey) {
        lastResetDay = dayKey;
        lastSentHour = null;
        sentReminders.goodMorning = false;
        sentReminders.morningAmol = false;
        sentReminders.dailyDua = false;
        sentReminders.morningContent = false;
        sentReminders.goodNight = false;
        sentReminders.eveningAmol = false;
        sentReminders.deceasedDua = false;
        sentReminders.ramadanMsg = false;
        sentReminders.prayerReminders = {};
      }

      const engDate = bd.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const bnDate  = bd.toLocaleDateString('bn-BD',  { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const bnTime  = bd.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true });
      const hijriDate = getHijriDate(bd);
      const prayerTimes = getPrayerTimesForDivision(global.currentDivision);

      // ========== ১) প্রতি ঘণ্টায় দোয়া (০ মিনিটে) ==========
      if (minute === 0 && hour !== lastSentHour) {
        lastSentHour = hour;
        const currentMessage = nazrul.find(item => parseInt(item.timer) === hour);
        if (currentMessage) {
          const data = { engDate, bnDate, hijriDate, bnTime, divisionName: global.currentDivision, dua: currentMessage.message.join("\n") };
          await broadcast(api, getHourlyFrame(data, prayerTimes));
        }
      }

      // ========== ২) গুড মর্নিং (৭:৪০) ==========
      if (hour === 7 && minute === 40 && !sentReminders.goodMorning) {
        sentReminders.goodMorning = true;
        const msg = goodMorningMsg[Math.floor(Math.random() * goodMorningMsg.length)];
        await broadcast(api, getGoodMorningFrame(msg));
      }

      // ========== ৩) সকালের আমল (৫:২০) ==========
      if (hour === 5 && minute === 20 && !sentReminders.morningAmol) {
        sentReminders.morningAmol = true;
        const msg = getAmolFrame('morning');
        if (msg) await broadcast(api, msg);
      }

      // ========== ৪) ডেইলি দোয়া (১৬:৩০) ==========
      if (hour === 16 && minute === 30 && !sentReminders.dailyDua) {
        sentReminders.dailyDua = true;
        const duaList = dailyDua.filter(d => d.time === "বিকাল");
        const dua = duaList[Math.floor(Math.random() * duaList.length)].dua;
        await broadcast(api, getDailyDuaFrame(dua));
      }

      // ========== ৫) সকালের দৈনিক কনটেন্ট (৫:১০) ==========
      if (hour === 5 && minute === 10 && !sentReminders.morningContent) {
        sentReminders.morningContent = true;
        const duaList = dailyDua.filter(d => d.time === "সকাল");
        const dua = duaList[Math.floor(Math.random() * duaList.length)].dua;
        const hadith = dailyHadith[Math.floor(Math.random() * dailyHadith.length)];
        const quote  = islamicQuotes[Math.floor(Math.random() * islamicQuotes.length)];
        await broadcast(api, getDailyIslamicFrame(dua, hadith, quote));
      }

      // ========== ৬) সন্ধ্যার আমল (১৮:৩০) ==========
      if (hour === 18 && minute === 30 && !sentReminders.eveningAmol) {
        sentReminders.eveningAmol = true;
        const msg = getAmolFrame('evening');
        if (msg) await broadcast(api, msg);
      }

      // ========== ৭) মৃতদের জন্য দোয়া (শুক্রবার ১৭:০০) ==========
      if (bd.getDay() === 5 && hour === 17 && minute === 0 && !sentReminders.deceasedDua) {
        sentReminders.deceasedDua = true;
        await broadcast(api, getDeceasedDuaFrame());
      }

      // ========== ৮) গুড নাইট (২২:০০) ==========
      if (hour === 22 && minute === 0 && !sentReminders.goodNight) {
        sentReminders.goodNight = true;
        const msg = goodNightMsg[Math.floor(Math.random() * goodNightMsg.length)];
        await broadcast(api, getGoodNightFrame(msg));
      }

      // ========== ৯) রমজান মেসেজ (রমজান মাসে ২০:০০) ==========
      // (হিজরী মাস চেক)
      try {
        const hijriMonth = new Intl.DateTimeFormat('en-u-ca-islamic', { month: 'numeric' }).format(bd);
        if (hijriMonth === "9" && hour === 20 && minute === 0 && !sentReminders.ramadanMsg) {
          sentReminders.ramadanMsg = true;
          const msg = ramadanMessage[Math.floor(Math.random() * ramadanMessage.length)];
          await broadcast(api, getRamadanFrame(msg));
        }
      } catch {}

      // ========== ১০) নামাজের রিমাইন্ডার + আজান অডিও
