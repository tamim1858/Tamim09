const fs = require('fs');
const statusFilePath = __dirname + '/antigaliStatus.json';

// ================== কনফিগ ==================
let antiGaliStatus = true;
const BOT_ADMINS = ['61591542717221']; // আপনার বট/ওনার UID
const BRAND_NAME = '乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐';

// কতবার গালি দিলে কিক হবে
const KICK_THRESHOLD = 3;

try {
    if (fs.existsSync(statusFilePath)) {
        const data = JSON.parse(fs.readFileSync(statusFilePath, 'utf8'));
        if (typeof data.status === 'boolean') antiGaliStatus = data.status;
    }
} catch {}

function saveStatus() {
    try {
        fs.writeFileSync(statusFilePath, JSON.stringify({ status: antiGaliStatus }, null, 2));
    } catch {}
}

// ================== অশালীন শব্দ ==================
const badWords = [
    'magi', 'mang', 'mader', 'madarchod', 'chudi', 'choda', 'chud', 'chod',
    'sawya', 'sauya', 'voda', 'bhoda', 'rendi', 'bokachoda', 'bokacoda',
    'chodna', 'chudbo', 'chudbi', 'gandu', 'gand',
    'fuck', 'fucker', 'fucking', 'motherfucker', 'bloodyhell',
    'bollocks', 'xoda', 'xodi', 'pompom', 'hada', 'hata',
    'abal', 'chup magi', 'tor heda', 'tor hed',
    'tui magi', 'tui mang', 'tui bal', 'gitar bajao', 'guitar bajao',
    'মাগি', 'মাং', 'মাদারচোদ', 'চুদি', 'চোদা', 'চুদ', 'চোদ', 'সাউয়া',
    'ভোদা', 'রেন্ডি', 'বোকাচোদা', 'বোকাচুদা', 'গান্ডু',
    'তোর মা', 'তোর বোন', 'তোর বাপ', 'তুই মাগি', 'তুই মাং', 'তুই বাল',
    'হাত মাড়ি', 'হাত মারি', 'হাত মারবো', 'গিটার বাজাও', 'মাংগের', 'সাউয়ার',
    'চোকাচোদা', 'চুদানির', 'আবাল', 'কার বাল', 'পুটকি', 'ছিনাল',
    'খানকি', 'খানকির', 'জারজ', 'কুত্তা', 'কুত্তার', 'শুয়োর', 'শুয়োরের'
];

// ================== Offense Tracker ==================
// { threadID: { senderID: { count, lastMessageID } } }
let offenseTracker = {};

// ================== নোটিফিকেশন ফ্রেম ==================
const createNotificationFrame = (title, body, type = 'info') => {
    const icons = { warning: '🚫', danger: '⚠️', info: 'ℹ️', success: '✅' };
    const icon = icons[type] || 'ℹ️';

    let msg = `${icon} ${title}\n`;
    msg += '━━━━━━━━━━━━━━━━━━━━\n';
    msg += body + '\n';
    msg += '━━━━━━━━━━━━━━━━━━━━\n';
    msg += `✨ ${BRAND_NAME}`;
    return msg;
};

// ================== হেল্পার ==================
async function getBotUID(api) {
    try {
        let uid = api.getCurrentUserID ? api.getCurrentUserID() : null;
        if (uid && typeof uid.then === 'function') uid = await uid;
        return uid ? String(uid) : null;
    } catch {
        return null;
    }
}

function normalizeAdminIDs(threadInfo) {
    let raw = threadInfo?.adminIDs || threadInfo?.adminID || [];
    if (!Array.isArray(raw)) raw = [raw];
    return raw
        .map(a => (typeof a === 'string' ? a : a && a.id))
        .filter(Boolean)
        .map(String);
}

// ================== মডিউল কনফিগ ==================
module.exports.config = {
    name: 'antigali',
    version: '5.0.0',
    hasPermssion: 0,
    credits: 'MR JUWEL',
    description: '৩ বার গালি দিলে অটো কিক',
    commandCategory: 'moderation',
    usages: '[on/off/status/reset]',
    cooldowns: 3
};

// ================== handleEvent ==================
module.exports.handleEvent = async function ({ api, event, Threads }) {
    try {
        if (!antiGaliStatus) return;
        if (!event.body || !event.threadID || !event.senderID) return;

        const botUID = await getBotUID(api);
        if (botUID && String(event.senderID) === botUID) return;

        const body = event.body.toLowerCase();
        const threadID = String(event.threadID);
        const senderID = String(event.senderID);

        // offense tracker init
        if (!offenseTracker[threadID]) offenseTracker[threadID] = {};
        if (!offenseTracker[threadID][senderID]) {
            offenseTracker[threadID][senderID] = { count: 0, lastMessageID: null };
        }

        // bad word চেক
        const matched = badWords.some(w => body.includes(w.toLowerCase()));
        if (!matched) return;

        const offense = offenseTracker[threadID][senderID];
        offense.count += 1;
        offense.lastMessageID = event.messageID;
        const count = offense.count;

        // ⛔ ১ম ও ২য় বার → কিছুই করবে না, চুপচাপ গুনে রাখবে
        if (count < KICK_THRESHOLD) {
            return;
        }

        // ===== ৩য় বার (বা তার বেশি) হলে সম্পূর্ণ অ্যাকশন =====

        // ইউজার ইনফো
        let userName = 'অজানা ব্যবহারকারী';
        try {
            const uInfo = await api.getUserInfo(senderID);
            if (uInfo?.[senderID]?.name) userName = uInfo[senderID].name;
        } catch {}

        // থ্রেড ইনফো
        let threadInfo = {};
        try {
            if (typeof api.getThreadInfo === 'function') {
                threadInfo = (await api.getThreadInfo(threadID)) || {};
            } else if (Threads?.getData) {
                threadInfo = (await Threads.getData(threadID)) || {};
            }
        } catch (e) {
            console.error('[antigali] getThreadInfo error:', e.message);
        }

        const adminIDs = normalizeAdminIDs(threadInfo);
        const threadName = threadInfo.threadName || threadInfo.name || 'Unknown Group';
        const isAdmin = (uid) => adminIDs.includes(String(uid));
        const botIsAdmin = botUID ? isAdmin(botUID) : false;

        // ---------- অ্যাডমিনদের ইনবক্সে অ্যালার্ট ----------
        const alertMsg = createNotificationFrame(
            '🚨 Anti-Gali Alert',
            `👥 গ্রুপ: ${threadName}\n` +
            `👤 ইউজার: ${userName}\n` +
            `🆔 UID: ${senderID}\n` +
            `⚠️ অপরাধ: ${count} বার\n\n` +
            `💬 শেষ মেসেজ:\n"${event.body}"`,
            'danger'
        );

        for (const aid of adminIDs) {
            if (botUID && aid === botUID) continue;
            try { await api.sendMessage(alertMsg, aid); } catch {}
        }
        for (const bid of BOT_ADMINS) {
            try { await api.sendMessage(alertMsg, bid); } catch {}
        }

        // ---------- বট অ্যাডমিন না হলে কিক করা যাবে না ----------
        if (!botIsAdmin) {
            offense.count = KICK_THRESHOLD - 1; // আবার ট্রিগার হবে
            return api.sendMessage(
                createNotificationFrame(
                    '⚠️ কিক করা যায়নি',
                    `আমি (বট) এই গ্রুপের অ্যাডমিন নই, তাই কাউকে কিক করতে পারছি না।\n\n` +
                    `👤 ইউজার: ${userName}\n🆔 UID: ${senderID}\n\n` +
                    `📌 আমাকে গ্রুপ অ্যাডমিন বানান।`,
                    'danger'
                ),
                threadID
            );
        }

        // ---------- কিক করা ইউজার নিজেই অ্যাডমিন হলে কিক করা যাবে না ----------
        if (isAdmin(senderID)) {
            offense.count = KICK_THRESHOLD - 1;
            return api.sendMessage(
                createNotificationFrame(
                    '⚠️ অ্যাডমিনকে কিক করা যায় না',
                    `এই ব্যবহারকারী গ্রুপের একজন অ্যাডমিন।\n\n` +
                    `👤 ${userName}\n🆔 ${senderID}\n\n` +
                    `📌 গ্রুপ অ্যাডমিন থেকে প্রথমে রিমুভ করুন।`,
                    'warning'
                ),
                threadID
            );
        }

        // ---------- গ্রুপে নোটিশ + অটো কিক ----------
        try {
            await api.sendMessage(
                createNotificationFrame(
                    '🚨 অটো কিক',
                    `👤 ${userName}\n` +
                    `🆔 UID: ${senderID}\n\n` +
                    `⚠️ ${KICK_THRESHOLD} বার অশালীন শব্দ ব্যবহারের কারণে\n` +
                    `এই ব্যবহারকারীকে গ্রুপ থেকে রিমুভ করা হলো। 🔪`,
                    'danger'
                ),
                threadID
            );

            await api.removeUserFromGroup(senderID, threadID);

            // tracker রিসেট
            offense.count = 0;
            offense.lastMessageID = null;

            // কিকের পর অ্যাডমিনদের আরেকবার কনফার্মেশন
            const doneMsg = createNotificationFrame(
                '✅ কিক সম্পন্ন',
                `👥 গ্রুপ: ${threadName}\n` +
                `👤 ইউজার: ${userName}\n` +
                `🆔 UID: ${senderID}\n\n` +
                `সফলভাবে গ্রুপ থেকে রিমুভ করা হয়েছে। ✅`,
                'success'
            );

            for (const aid of adminIDs) {
                if (botUID && aid === botUID) continue;
                try { await api.sendMessage(doneMsg, aid); } catch {}
            }
            for (const bid of BOT_ADMINS) {
                try { await api.sendMessage(doneMsg, bid); } catch {}
            }
        } catch (e) {
            offense.count = KICK_THRESHOLD - 1;
            console.error('[antigali] kick error:', e.message);
            return api.sendMessage(
                createNotificationFrame(
                    '❌ কিক ব্যর্থ',
                    `👤 ${userName}\n🆔 ${senderID}\n\n🔍 Error: ${e.message}`,
                    'danger'
                ),
                threadID
            );
        }

        // ---------- আগের মেসেজগুলো আনসেন্ড (কিকের পর) ----------
        // (মেসেজ ডিলিট করতে চাইলে এখানে রাখা হলো)
        if (event.messageID && typeof api.unsendMessage === 'function') {
            try { await api.unsendMessage(event.messageID); } catch {}
        }

    } catch (err) {
        console.error('[antigali] error:', err);
    }
};

// ================== run কমান্ড ==================
module.exports.run = async function ({ api, event, args }) {
    const threadID = event.threadID;
    const senderID = String(event.senderID);

    let isAllowed = BOT_ADMINS.map(String).includes(senderID);

    if (!isAllowed) {
        try {
            const info = await api.getThreadInfo(threadID);
            const adminIDs = normalizeAdminIDs(info);
            isAllowed = adminIDs.includes(senderID);
        } catch {}
    }

    if (!isAllowed) {
        return api.sendMessage(
            createNotificationFrame(
                '🚫 অনুমতি নেই',
                'এই কমান্ড শুধু গ্রুপ অ্যাডমিন বা বট অ্যাডমিন চালাতে পারবেন।',
                'danger'
            ),
            threadID
        );
    }

    const action = (args[0] || '').toLowerCase();

    if (action === 'on') {
        antiGaliStatus = true;
        saveStatus();
        return api.sendMessage(
            createNotificationFrame('✅ Anti-Gali ON', 'Anti-Gali সিস্টেম চালু হয়েছে।', 'success'),
            threadID
        );
    } else if (action === 'off') {
        antiGaliStatus = false;
        saveStatus();
        return api.sendMessage(
            createNotificationFrame('🚫 Anti-Gali OFF', 'Anti-Gali সিস্টেম বন্ধ হয়েছে।', 'warning'),
            threadID
        );
    } else if (action === 'status') {
        // এই গ্রুপের সব ইউজারের warning count দেখাবে
        let report = '';
        const groupData = offenseTracker[threadID] || {};
        const entries = Object.entries(groupData).filter(([, v]) => v.count > 0);

        if (entries.length === 0) {
            report = 'এই গ্রুপে কোনো ওয়ার্নিং নেই। ✅';
        } else {
            for (const [uid, val] of entries) {
                let nm = uid;
                try {
                    const u = await api.getUserInfo(uid);
                    if (u?.[uid]?.name) nm = u[uid].name;
                } catch {}
                report += `👤 ${nm}\n🆔 ${uid}\n⚠️ ${val.count}/${KICK_THRESHOLD} বার\n\n`;
            }
        }

        return api.sendMessage(
            createNotificationFrame(
                'ℹ️ Anti-Gali Status',
                `সিস্টেম: ${antiGaliStatus ? '✅ চালু' : '🚫 বন্ধ'}\n` +
                `কিক থ্রেশহোল্ড: ${KICK_THRESHOLD} বার\n\n` +
                report,
                'info'
            ),
            threadID
        );
    } else if (action === 'reset') {
        if (offenseTracker[threadID]) offenseTracker[threadID] = {};
        return api.sendMessage(
            createNotificationFrame('✅ Reset', 'এই গ্রুপের সব ওয়ার্নিং রিসেট হয়েছে।', 'success'),
            threadID
        );
    } else if (action === 'set' && args[1]) {
        // ভবিষ্যতে threshold পরিবর্তনের জন্য (দরকার হলে)
        const num = parseInt(args[1]);
        if (num > 0) {
            // এখানে const KICK_THRESHOLD পরিবর্তন করতে হবে → let করে নিন
            return api.sendMessage(
                createNotificationFrame(
                    'ℹ️ তথ্য',
                    `বর্তমান threshold: ${KICK_THRESHOLD}\nপরিবর্তন করতে চাইলে কোডে গিয়ে KICK_THRESHOLD ভেরিয়েবল এডিট করুন।`,
                    'info'
                ),
                threadID
            );
        }
    }

    return api.sendMessage(
        createNotificationFrame(
            'ℹ️ ব্যবহারবিধি',
            `• antigali on — চালু\n` +
            `• antigali off — বন্ধ\n` +
            `• antigali status — ওয়ার্নিং লিস্ট\n` +
            `• antigali reset — রিসেট`,
            'info'
        ),
        threadID
    );
};
