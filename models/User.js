var appRoot = require('app-root-path');
var db = require(appRoot + '/my_node_libs/db.js');
var crypt = require(appRoot + '/my_node_libs/crypt.js');
var User = require(appRoot + '/models/User.js').User;
var Q = require('q');

exports.User = class User {
  constructor(id, name, charThumbnailUrl, hashedPassword, encryptedEmail, lastLoginedAt, createdAt) {
    this.id = id; // NOTE: character id
    this.name = name;
    this.charThumbnailUrl = charThumbnailUrl;
    this.hashedPassword = hashedPassword
    this.encryptedEmail = encryptedEmail;
    this.lastLoginedAt = lastLoginedAt;
    this.createdAt = createdAt;
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getCharacterThumbnailUrl() {
    return this.charThumbnailUrl;
  }

  getHashedPassword() {
    return this.hashedPassword;
  }

  getEncryptedEmail() {
    return this.encryptedEmail;
  }

  getLastLoginedAt() {
    return this.lastLoginedAt;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  // static functions
  static selectById(id) {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query("SELECT * FROM user WHERE id = ?", [id], function (err, rows, fields) {

      if (rows.length) {
        var row = rows[0];
        d.resolve(new User(
          row["id"],
          row["name"],
          row["char_thumbnail_url"],
          row["password"],
          row["email"],
          row["last_logined_at"],
          row["created_at"],
        ));
      } else {
        d.reject("could not find records");
      }

      con.end();
    });

    return d.promise;
  }

  static selectByEmail(email) {
    var d = Q.defer();

    var encryptedEmail = crypt.encrypt(email);
    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query("SELECT * FROM user WHERE email = ?", [encryptedEmail], function (err, rows, fields) {

      if (rows.length) {
        var row = rows[0];
        d.resolve(new User(
          row["id"],
          row["name"],
          row["char_thumbnail_url"],
          row["password"],
          row["email"],
          row["last_logined_at"],
          row["created_at"],
        ));
      } else {
        d.reject("could not find records");
      }

      con.end();
    });

    return d.promise;
  }

  static insertNewUserWithUpdateIsConfirmed(charId, name, charThumbnailUrl, password, email) {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;

    con.beginTransaction(function (err) {
      if (err) {
        throw err;
      }

      // update isConfirmed flag
      con.query(
        "UPDATE temp_user SET ? WHERE id = ?",
        [{is_confirmed: 1}, charId],
        function (error, results, fields) {
          if (error) {
            console.log(error.stack);
            d.reject("DB problem");
            return;
          }

          // insert new user
          con.query(
            "INSERT INTO user SET ?",
            {
              id: charId,
              name: name,
              char_thumbnail_url: charThumbnailUrl,
              password: password,
              email: email,
            },
            function (error, results, fields) {
              if (error) {
                console.log(error.stack);
                d.reject("DB problem");

                con.rollback(function () {
                  throw err;
                });
              }

              con.commit(function (err) {
                if (err) {
                  d.reject();
                  con.rollback(function () {
                    throw err;
                  });
                }

                d.resolve();
                con.end();
              });

            }
          );
        }
      );

    });

    return d.promise;
  }

  static updateLastLoginedAtByUserId(userId) {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;

    con.query(
      "UPDATE user SET last_logined_at = CURRENT_TIMESTAMP WHERE id = ?",
      [userId],
      function (error, results, fields) {
        if (error) {
          console.log(error.stack);
          d.reject("DB problem");
          return;
        }

        d.resolve();
      });

    return d.promise;
  }

}
