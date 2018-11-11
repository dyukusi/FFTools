var appRoot = require('app-root-path');
var CharacterSnapshot = require(appRoot + '/models/CharacterSnapshot.js').CharacterSnapshot;
var db = require(appRoot + '/my_node_libs/db.js');
var Q = require('q');

exports.CharacterSnapshot = class CharacterSnapshot {
  constructor(id, groupId, userId, date, server_id, name, title, raceId, genderId, avatarImgURL, portraitImgURL, biography, freeCompanyId, jobId, level) {
    this.id = id;
    this.groupId = groupId;
    this.userId = userId;
    this.date = date;
    this.server_id = server_id;
    this.name = name;
    this.title = title;
    this.raceId = raceId;
    this.genderId = genderId;
    this.avatarImgURL = avatarImgURL;
    this.portraitImgURL = portraitImgURL;
    this.biography = biography;
    this.freeCompanyId = freeCompanyId;
    this.jobId = jobId;
    this.level = level;
  }

  getId() {
    return this.id;
  }

  getGroupId() {
    return this.groupId;
  }

  getUserId() {
    return this.userId;
  }

  getDate() {
    return this.date;
  }

  getServerId() {
    return this.server_id;
  }

  getName() {
    return this.name;
  }

  getTitle() {
    return this.title;
  }

  getRaceId() {
    return this.raceId;
  }

  getGenderId() {
    return this.genderId;
  }

  getAvatarImgURL() {
    return this.avatarImgURL;
  }

  getPortraitImgURL() {
    return this.portraitImgURL;
  }

  getBiography() {
    return this.biography;
  }

  getFreeCompanyId() {
    return this.freeCompanyId;
  }

  getJobId() {
    return this.jobId;
  }

  getLevel() {
    return this.level;
  }

  getId() {
    return this.id;
  }

  getNameEng() {
    return this.nameEng;
  }

  // static functions
  static rowToModel(row) {
    return new CharacterSnapshot(
      row['id'],
      row['group_id'],
      row['user_id'],
      row['date'],
      row['server_id'],
      row['name'],
      row['title'],
      row['race_id'],
      row['gender_id'],
      row['avatar_img_url'],
      row['portrait_img_url'],
      row['biography'],
      row['free_company_id'],
      row['job_id'],
      row['level'],
    );
  }

  static selectById(snapshotId) {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query("SELECT * FROM character_snapshot WHERE id = ?",
      [snapshotId],
      function (err, rows, fields) {
        if (err) {
          throw new Error(err);
          d.reject();
          return;
        }

        if (rows.length < 1) {
          d.reject();
          return;
        }

        var model = CharacterSnapshot.rowToModel(rows[0]);

        d.resolve(model);
        con.end();
      });

    return d.promise;
  }
}
