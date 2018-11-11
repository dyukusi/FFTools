var config = require('config');

exports.LOADSTONE_CHAR = "https://eu.finalfantasyxiv.com/lodestone/character/%d/";
exports.REGISTRATION_CONFIRM_URL = config.registration_confirm_url_base;
exports.YOUTUBE_DATA_API_URL_BASE = "https://www.googleapis.com/youtube/v3/videos?id=%s&key=%s&part=contentDetails";
exports.CONFIRMATION_MAIL_TEXT =
  "This is final step to create your account for FFTimelines.\n\n" +
  "Your HashCode: %s \n" +
  "Your Loadstone URL: %s \n\n" +
  "1. Copy&Paste HashCode to your Character Profile form in Loadstone. \n" +
  "2. Access %s \n" +
  "3. COMPLETE! :)";

exports.TWITTER_API_KEYS = config.twitter_api;
exports.TWEET_NEW_TIMELINE_TEXT = "https://www.yukapero.com/fftimelines/edit/%s\n%s has been released!\n#FFTimelines #FF14";
exports.TWEET_UPDATED_TIMELINE_TEXT = "https://www.yukapero.com/fftimelines/edit/%s\n%s has been updated! #FFTimelines #FF14";

exports.VALIDATION_ERROR_TYPES = {
  INVALID_YOUTUBE_ID: 1,
  TOO_SHORT_PASSWORD: 2,
  INVALID_CONTENT_ID: 3,
  TOO_SHORT_TITLE: 4,
  NO_LANGUAGE_SPECIFIED: 5,
  MUST_BE_LOGINED: 6,
};

var db = config.db;
exports.DB = {
  HOST: db.host,
  USER: db.user,
  PASSWORD: db.password,
  DATABASE: db.database,
};

var tmEmail = config.tm_email;
exports.TM_EMAIL = {
  ADDRESS: tmEmail.address,
  PASSWORD: tmEmail.password,
}

exports.GOOGLE_API_KEY = config.google_api_key;

exports.ROLE_NAME_TO_ID = {
  COMMON: 0,
  TANK: 1,
  HEALER: 2,
  MELEE: 3,
  PHYSICAL_RANGED: 4,
  MAGICAL_RANGED: 5,
};

exports.JOB_NAME_TO_ID = {
  PLD: 1,
  WAR: 2,
  DRK: 3,
  WHM: 4,
  SCH: 5,
  AST: 6,
  MNK: 7,
  DRG: 8,
  NIN: 9,
  SAM: 10,
  BRD: 11,
  MCH: 12,
  BLM: 13,
  SMN: 14,
  RDM: 15,
};

exports.CRYPTO = {
  KEY: config.crypto.key,
  IV: config.crypto.iv,
};

// 0: DC id
// 1: alternative id
exports.DC_NAME_TO_ID_INFO = {
  Elemental: [1, 100],
  Gaia:      [2, 101],
  Mana:      [3, 102],
  Aether:    [4, 103],
  Primal:    [5, 104],
  Chaos:     [6, 105],
};

exports.TEMP_JOB_ID_TO_MY_JOB_ID = {
  8: 101, // 木工
  9: 102, // 鍛冶師
  10: 103, // 甲冑
  11: 104, // 彫金
  12: 105, // 革細工
  13: 106, // 裁縫
  14: 107, // 錬金
  15: 108, // 調理
  16: 201, // 採掘師
  17: 202, // 園芸
  18: 203, // 漁師
  19: 1, // ナイト
  20: 7, // モンク
  21: 2, // 戦士
  22: 8, // 竜騎士
  23: 11, // 詩人
  24: 4, // 白
  25: 13, //黒魔道士
  27: 14, //召喚
  28: 5, // 学者
  30: 9, // 忍者
  31: 12, // 機工士
  32: 3, // 暗黒騎士
  33: 6, // 占星
  34: 10, // 侍
  35: 15, // 赤
};
