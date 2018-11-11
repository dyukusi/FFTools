var appRoot = require('app-root-path');
var Role = require(appRoot + '/models/Role.js').Role;
var db = require(appRoot + '/my_node_libs/db.js');
var Q = require('q');

exports.Role = class Role {
  constructor(id, name_en, name_ja, icon_path) {
    this.id = id;
    this.name_en = name_en;
    this.name_ja = name_ja;
    this.icon_path = icon_path;
  }

  getId() {
    return this.id;
  }

  getNameENG() {
    return this.name_en;
  }

  getNameJP() {
    return this.name_ja;
  }

  getIconPath() {
    return this.icon_path;
  }

  // static functions
  static selectAll() {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query("SELECT * FROM role;", function (err, rows, fields) {

      if (rows.length) {
        var models = [];
        __.each(rows, function (row) {
          models.push(new Role(
            row["id"],
            row["name_en"],
            row["name_ja"],
            row["icon_path"],
          ));
        });

        d.resolve(models);
      } else {
        d.reject("could not find records");
      }

      con.end();
    });

    return d.promise;
  }
}
