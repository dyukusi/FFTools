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
