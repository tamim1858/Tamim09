module.exports.config = {
  name: "bio",
  version: "1.0.3",
  hasPermssion: 0,
  credits: "SHAHADAT SAHU",
  description: "random bio",
  commandCategory: "bio",
  usages: "bio",
  cooldowns: 5
};

const FOOTER = "\n\n───🎀🪄⤹🍥⤸📰🌷────⎞\n╰──⎯꯭𓆩꯭𝆺𝅥😻⃞𝐌⃞𝆠፝֟𝐑᭄ღ 𝐓⃞𝐀⃞𝐌⃞𝐈⃞𝐌༢";

const tl = [
  "❤‍🔥•┼┼•🌹•┼┼•❤‍🔥\n✮┼✮\n━━❖❖♥❖❖━━\n꧁𑁍Love U𑁍꧂\n━━❖❖♥❖❖━━\n✮┼✮\n❤‍🔥•┼┼•🌹•┼┼•❤‍🔥",

  "꧁━•❃😍∆😍❃•━꧂.\n꧁━•❃🥳∆🥳❃•━꧂\n꧁━•❃😁∆😁❃•━꧂\n꧁━•❃😘∆😘❃•━꧂\n꧁━•❃😚∆😚❃•━꧂\n꧁━•❃🤩∆🤩❃•━꧂\n꧁━•❃😊∆😊❃•━꧂",

  "┉┅━✿꧁Devil꧂✿━┅┉\n◢◤♦◥◣\n◥◣🖤◢◤\n◥◣♦◢◤\n♦◈⚀ ★😈★⚀◈♦\n◢◤♦◥◣\n◢◤🖤◥◣\n◥◣♦◢◤\n┉┅━✿꧁BOY꧂✿━┅┉",

  "⟣⃟⸻🖤⸻⃟⟢\n❚🧡❚\n❚🖤❚\n❚❤❚\n❚💙❚\n❚🖤❚\n❚💛❚\n❚🖤❚\n❚❤❚\n⟣⃟⸻🖤⸻⃟⟢",

  "◢◣\n◢◤💓◥◣\n◥◣💓◢◤\n◥◤\n❖─❥♥❥─❖\n╔━━❖❖🖤❖❖━━╗\n◆⚜☬❉KiNg❉⚜☬◆\n╚━━❖❖🖤❖❖━━╝\n❖─❥♥❥─❖\n◢◣\n◢◤💓◥◣\n◥◣💓◢◤\n◥◤",

  "♦️━━••━━♦️\n♦️━━••━━♦️\n,•’“’•,•’“’•,\n’•,` ❤ ` •’\n`’•,,•’`\n♦️━━••━━♦️\n❣️━━••━━❣️",

  "❣☬❣●▬▬๑♦️๑▬▬●❣☬❣\n━━❖❖♥❖❖━━\n❣☬❣\n❣☬❣\n❣☬❣\n❣☬❣\n❣☬❣\n❣☬❣\n❣☬❣\n❣☬❣\n❣☬❣\n❣☬❣\n❣☬❣\n━━❖❖♥❖❖━━\n❣☬❣●▬▬๑♦️๑▬▬●❣☬❣",

  "❥❥━──➸➽❂❥❥━──➸➽\n★̴★\n✧✧✧\n┊┊┊┊┊┊┊⇣❥\n┊┊┊┊┊┊⇣❥\n┊┊┊┊┊⇣❥\n┊┊┊┊⇣❥\n┊┊┊⇣❥\n┊┊⇣❥\n┊⇣❥\n⇣❥\n❥❥━──➸➽❂",

  "┏━━━━━•°**°•━━━━━┓\n◈★◈\n◈\n◈★◈\n⟣⃟⸻⚀♦️༻༺⚀⸻⃟⟢\n◈★◈\n◈\n◈★◈\n⟣⃟⸻⚀♦️༻༺♦️⚀⸻⃟⟢\n◈★◈\n◈\n◈★◈\n┗━━━━━•°**°•━━━━━┛",

  "♦️━━━━━•°°•━━━━━♦️\n☆★\n★☆\n✯\n⟣⃟⸻⚀▞༻༺▞⚀⸻⃟⟢\n✯\n✯\n⟣⃟⸻⚀▞༻༺▞⚀⸻⃟⟢\n✯\n★☆\n☆★\n♦️━━━━━•°°•━━━━━♦️",

  "💓╔══╗\n💓╚╗╔╝ ╔╗╔═╦╦╦═╗ ╔╗╔╗\n💓╔╝╚╗ ║╚╣║║║║╩╣ ║╚╝║\n💓╚══╝ ╚═╩═╩═╩═╝ ╚══╝"
];

function getRandomBio() {
  return tl[Math.floor(Math.random() * tl.length)] + FOOTER;
}

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body } = event;
  if (!body) return;

  if (body.trim().toLowerCase() === module.exports.config.name) {
    const rand = getRandomBio();
    return api.sendMessage({ body: rand }, threadID, messageID);
  }
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const rand = getRandomBio();
  return api.sendMessage({ body: rand }, threadID, messageID);
};
