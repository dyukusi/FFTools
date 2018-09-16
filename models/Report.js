var Report = require(appRoot + '/models/Report.js').Report;
var crypt = require(appRoot + '/my_node_libs/crypt.js');
var db = require(appRoot + '/my_node_libs/db.js');

exports.Report = class Report {
  constructor(id, timelineIdHash, email, text, createdAt) {
    this.id = id;
    this.timelineIdHash = timelineIdHash;
    this.email = email;
    this.text = text;
    this.createdAt = createdAt;
  }

  getId() {
    return this.id;
  }

  getTimelineIdHash() {
    return this.timelineIdHash;
  }

  getEmail() {
    return this.email;
  }

  getText() {
    return this.text;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  // static functions
  static insert(timelineIdHash, email, text) {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    var encryptedEmail = crypt.encrypt(email);

    con.query(
      "INSERT INTO report SET ?",
      {
        timeline_id_hash: timelineIdHash,
        email: encryptedEmail,
        text: text,
      },
      function (error, results, fields) {
        if (error) {
          d.reject("DB problem");
          throw new Error(error);
        }

        d.resolve();
        con.end();
      }
    );

    return d.promise;
  }
}
