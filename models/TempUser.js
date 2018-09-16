var appRoot = require('app-root-path');
var db = require(appRoot + '/my_node_libs/db.js');
var crypt = require(appRoot + '/my_node_libs/crypt.js');
var TempUser = require(appRoot + '/models/TempUser.js').TempUser;
var Q = require('q');

exports.TempUser = class TempUser {
  constructor(id, hashedPassword, encryptedEmail, hash, isConfirmed, createdAt) {
    this.id = id; // NOTE: character id
    this.hashedPassword = hashedPassword
    this.encryptedEmail = encryptedEmail;
    this.hash = hash;
    this.isConfirmed = isConfirmed;
    this.createdAt = createdAt;
  }

  getId() {
    return this.id;
  }

  getHashedPassword() {
    return this.hashedPassword;
  }

  getEncryptedEmail() {
    return this.encryptedEmail;
  }

  getHash() {
    return this.hash;
  }

  getIsConfirmed() {
    return this.isConfirmed ? true : false;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  // static functions
  static selectByHash(hash) {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query("SELECT * FROM temp_user WHERE hash = ?", [hash], function (err, rows, fields) {

      if (rows.length) {
        var row = rows[0];
        d.resolve(new TempUser(
          row["id"],
          row["password"],
          row["email"],
          row["hash"],
          row["is_confirmed"],
          row["created_at"],
        ));

      } else {
        d.reject("could not find records");
      }

      con.end();
    });

    return d.promise;
  }


  static insert(charId, password, email) {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    var hashedPassword = crypt.hashed(password);
    var encryptedEmail = crypt.encrypt(email);
    var hash = crypt.hashed(Date.now().toString());

    con.query(
      "INSERT INTO temp_user SET ?",
      {
        id: charId,
        password: hashedPassword,
        email: encryptedEmail,
        hash: hash,
        is_confirmed: false,
      },
      function (error, results, fields) {
        if (error) {
          d.reject("DB problem");
          throw new Error(error);
        }

        d.resolve({
          hash: hash
        });

        con.end();
      }
    );

    return d.promise;
  }
}
