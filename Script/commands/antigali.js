const fs = require('fs');
const path = __dirname + '/antigaliStatus.json';

// ================== কনফিগ ==================
let antiGaliStatus = true;
const BOT_ADMINS = ['61591542717221']; // আপনার বট/ওনার UID এখানে দিন
const BRAND_NAME = '乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐';

// থ্রেড ভিত্তিক স্ট্যাটাস লোড
try {
    if (fs.existsSync(path)) {
        const data = JSON.parse(fs.readFileSync(path, 'utf8'));
        if (typeof data.status === 'boolean') antiGaliStatus = data.status;
    }
} catch {}

function saveStatus() {
    try {
        fs.writeFileSync(path, JSON.stringify({ status: antiGaliStatus }, null, 2));
    } catch {}
}

// ================== অশালীন শব্দের তালিকা ==================
const badWords = [
    'magi', 'mang', 'mader', 'madarchod', 'chudi', 'choda', 'chud', 'chod',
    'sawya', 'sauya', 'voda', 'bhoda', 'rendi', 'bokachoda', 'bokacoda',
    'bal', 'boka', 'chodna', 'chudbo', 'chudbi', 'gandu', 'gand',
    'fuck', 'fucker', 'fucking', 'motherfucker', 'mother fucker', 'bloodyhell',
    'bollocks', 'head', 'xoda', 'xodi', 'pompom', 'pom pom', 'hada', 'hata',
    'abal', 'antigali', 'chup magi', 'tor heda', 'tor hed', 'toke', 'tui magi',
    'tui mang', 'tui bal', 'gitar bajao', 'guitar bajao',
    // বাংলা
    'মাগি', 'মাং', 'মাদারচোদ', 'চুদি', 'চোদা', 'চুদ', 'চোদ', 'সাউয়া', 'সাউয়া',
    'ভোদা', 'রেন্ডি', 'বোকাচোদা', 'বোকাচুদা', 'বাল', 'বোকা', 'গান্ডু',
    'তোর মা', 'তোর বোন', 'তোর বাপ', 'তুই মাগি', 'তুই মাং', 'তুই বাল',
    'হাত মাড়ি', 'হাত মারি', 'হাত মারবো', 'গিটার বাজাও', 'মাংগের', 'সাউয়ার',
    'চোকাচোদা', 'চুদানির', 'আবাল', 'কার বাল', 'পুটকি', 'মাদার', 'ছিনাল',
    'খানকি', 'খানকির', 'নষ্ট', 'জারজ', 'কুত্তা', 'কুত্তার', 'শুয়োর', 'শুয়োরের'
];

// ================== Offense Tracker ==================
let offenseTracker = {};

// ================== নোটিফিকেশন ফ্রেম ==================
const createNotificationFrame = (title, body, type = 'info') => {
    const icons = { warning: '🚫', danger: '⚠️', info: 'ℹ️', success: '✅' };
    const icon = icons[type] || 'ℹ️';

    const line = '═'.repeat(30);
    const top = '╔' + line + '╗';
    const bottom = '╚' + line + '╝';
    const sep = '╠' + line + '╣';
    const brand = '║ ' + BRAND_NAME + ' ║';

    let msg = top + '\n';
    msg += '║ ' + icon + ' ' + title.padEnd(26) + ' ║\n';
    msg += sep + '\n';

    const lines = String(body).split('\n');
    for (const l of lines) {
        if (l.trim()) {
            // বাংলা ক্যারেক্টার padEnd সমস্যা করে, তাই সরল রাখা হলো
            msg += '║ ' + l + '\n';
        } else {
            msg += '║ ' + ' '.repeat(28) + '║\n';
        }
    }

    msg += sep + '\n';
    msg += brand + '\n';
    msg += bottom;
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
    version: '4.0.0',
    hasPermssion: 0,
    credits: 'MR JUWEL',
    description: 'বাংলা Anti-Gali সিস্টেম (Admin + Bot Admin Inbox Forward সহ)',
    commandCategory: 'moderation',
    usages: '',
    cooldowns: 0
};

// ================== handleEvent ==================
module.exports.handleEvent = async function ({ api, event, Threads }) {
    try {
        if (!antiGaliStatus) return;
        if (!event.body || !event.threadID || !event.senderID) return;
        // নিজের মেসেজ ইগনোর
        const botUID = await getBotUID(api);
        if (botUID && String(event.senderID) === botUID) return;

        const body = event.body.toLowerCase();
        const threadID = String(event.threadID);
        const senderID = String(event.senderID);

        // offense tracker init
        if (!offenseTracker[threadID]) offenseTracker[threadID] = {};
        if (!offenseTracker[threadID][senderID]) {
            offenseTracker[threadID][senderID] = { count: 0, uidSaved: senderID };
        }

        // bad word চেক
        const matched = badWords.some(w => body.includes(w.toLowerCase()));
        if (!matched) return;

        const offense = offenseTracker[threadID][senderID];
        offense.count += 1;
        const count = offense.count;

        // ইউজার ইনফো
        let userName = 'অজানা ব্যবহারকারী';
        try {
            const uInfo = await api.getUserInfo(senderID);
            if (uInfo && uInfo[senderID] && uInfo[senderID].name) {
                userName = uInfo[senderID].name;
            }
        } catch {}

        // থ্রেড ইনফো
        let threadInfo = {};
        try {
            if (typeof api.getThreadInfo === 'function') {
                threadInfo = (await api.getThreadInfo(threadID)) || {};
            } else if (Threads && typeof Threads.getData === 'function') {
                threadInfo = (await Threads.getData(threadID)) || {};
            }
        } catch (e) {
            console.error('[antigali] getThreadInfo error:', e.message);
        }

        const adminIDs = normalizeAdminIDs(threadInfo);
        const threadName = threadInfo.threadName || threadInfo.name || 'Unknown Group';
        const isAdmin = (uid) => adminIDs.includes(String(uid));

        // অ্যাডমিনদের ইনবক্সে অ্যালার্ট
        const alertMsg = createNotificationFrame(
            '🚨 Anti-Gali Alert',
            `👥 গ্রুপ: ${threadName}\n` +
            `👤 ইউজার: ${userName}\n` +
            `🆔 UID: ${senderID}\n` +
            `⚠️ Warning: ${count}\n\n` +
            `💬 মেসেজ:\n"${event.body}"`,
            'danger'
        );

        for (const aid of adminIDs) {
            if (botUID && aid === botUID) continue;
            try { await api.sendMessage(alertMsg, aid); } catch {}
        }
        for (const bid of BOT_ADMINS) {
            try { await api.sendMessage(alertMsg, bid); } catch {}
        }

        // ============ ওয়ার্নিং মেসেজ ============
        const buildWarning = (num, extra = '') => {
            let msg = `⚠️ সতর্কবার্তা #${num}\n`;
            msg += `👤 ${userName} (UID: ${senderID})\n`;
            msg += `🔁 অপরাধের সংখ্যা: ${num} বার\n`;
            msg += `\n⚠️ আপনার মেসেজে অশালীন শব্দ পাওয়া গেছে।\n`;
            msg += `দয়া করে এখনই মেসেজটি আনসেন্ড করুন!`;
            if (extra) msg += `\n\n${extra}`;
            return createNotificationFrame(`সতর্কবার্তা #${num}`, msg, 'warning');
        };

        if (count === 1) {
            await api.sendMessage(
                buildWarning(1),
                threadID,
                event.messageID
            );
        } else if (count === 2) {
            await api.sendMessage(
                buildWarning(2, '⚠️ পরেরবার একই ভুল করলে আপনাকে রিমুভ করা হবে!'),
                threadID,
                event.messageID
            );
        }

        // ৬০ সেকেন্ড পর মেসেজ আনসেন্ড
        if (event.messageID && typeof api.unsendMessage === 'function') {
            setTimeout(() => {
                api.unsendMessage(event.messageID).catch(() => {});
            }, 60000);
        }

        // ============ ৩ বার হলে রিমুভ ============
        if (count === 3) {
            const botIsAdmin = botUID ? isAdmin(botUID) : false;

            if (!botIsAdmin) {
                offense.count = 2;
                const msg = createNotificationFrame(
                    '⚠️ কাজ বন্ধ',
                    `আমি (বট) এই গ্রুপের অ্যাডমিন নই, তাই কাউকে রিমুভ করতে পারছি না।\n\n` +
                    `👤 ইউজার: ${userName}\n🆔 UID: ${senderID}`,
                    'danger'
                );
                return api.sendMessage(msg, threadID);
            }

            if (isAdmin(senderID)) {
                offense.count = 2;
                const msg = createNotificationFrame(
                    '⚠️ অ্যাডমিন',
                    `এই ব্যবহারকারী গ্রুপের একজন অ্যাডমিন।\n\n` +
                    `👤 ইউজার: ${userName}\n🆔 UID: ${senderID}\n\n` +
                    `⚠️ কাজটি বন্ধ করা হয়েছে।`,
                    'warning'
                );
                return api.sendMessage(msg, threadID);
            }

            try {
                const removeMsg = createNotificationFrame(
                    '🚨 রিমুভ করা হয়েছে',
                    `${userName} (UID: ${senderID}) কে ৩ বার অশালীন শব্দ ব্যবহারের কারণে গ্রুপ থেকে রিমুভ করা হলো। 🤬🔪`,
                    'danger'
                );
                await api.sendMessage(removeMsg, threadID);
                await api.removeUserFromGroup(senderID, threadID);
                offense.count = 0;
            } catch (e) {
                offense.count = 2;
                console.error('[antigali] remove error:', e.message);
                const failMsg = createNotificationFrame(
                    '❌ ব্যর্থ',
                    `${userName} (UID: ${senderID})-কে কিক করতে ব্যর্থ।\n🔍 Error: ${e.message}`,
                    'danger'
                );
                return api.sendMessage(failMsg, threadID);
            }
        }
    } catch (err) {
        console.error('[antigali] error:', err);
        try {
            const errMsg = createNotificationFrame(
                '❌ ত্রুটি',
                `Anti-Gali সিস্টেমে একটি ত্রুটি ঘটেছে।\n🔍 Error: ${err.message || 'Unknown'}`,
                'danger'
            );
            api.sendMessage(errMsg, event.threadID);
        } catch {}
    }
};

// ================== run (on/off কমান্ড) ==================
module.exports.run = async function ({ api, event, args }) {
    const threadID = event.threadID;
    const senderID = String(event.senderID);

    // শুধু বট অ্যাডমিন বা গ্রুপ অ্যাডমিন চালাতে পারবে
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
            createNotificationFrame('✅ Anti-Gali ON', 'Anti-Gali সিস্টেম চালু করা হয়েছে।', 'success'),
            threadID
        );
    } else if (action === 'off') {
        antiGaliStatus = false;
        saveStatus();
        return api.sendMessage(
            createNotificationFrame('🚫 Anti-Gali OFF', 'Anti-Gali সিস্টেম বন্ধ করা হয়েছে।', 'warning'),
            threadID
        );
    } else if (action === 'status') {
        return api.sendMessage(
            createNotificationFrame(
                'ℹ️ Anti-Gali Status',
                `বর্তমান অবস্থা: ${antiGaliStatus ? '✅ চালু' : '🚫 বন্ধ'}`,
                'info'
            ),
            threadID
        );
    } else if (action === 'reset') {
        if (offenseTracker[threadID]) offenseTracker[threadID] = {};
        return api.sendMessage(
            createNotificationFrame('✅ Reset', 'এই গ্রুপের সব ওয়ার্নিং রিসেট করা হয়েছে।', 'success'),
            threadID
        );
    }

    return api.sendMessage(
        createNotificationFrame(
            'ℹ️ ব্যবহারবিধি',
            `antigali on — চালু করতে\n` +
            `antigali off — বন্ধ করতে\n` +
            `antigali status — অবস্থা দেখতে\n` +
            `antigali reset — ওয়ার্নিং রিসেট`,
            'info'
        ),
        threadID
    );
};
