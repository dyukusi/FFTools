const crypto = require('crypto');

function encrypt(text) {
  var cipher = crypto.createCipheriv('aes-256-ctr', MyConst.CRYPTO.KEY, MyConst.CRYPTO.IV);
  var crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text) {
  var decipher = crypto.createDecipheriv('aes-256-ctr', MyConst.CRYPTO.KEY, MyConst.CRYPTO.IV);
  var dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}

function hashed(password) {
  var hash = crypto.createHmac('sha512', password)
  hash.update(password)
  var value = hash.digest('hex')
  return value;
}

exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.hashed = hashed;
