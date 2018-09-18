var appRoot = require('app-root-path');
var Content = require(appRoot + '/models/Content.js').Content;
var db = require(appRoot + '/my_node_libs/db.js');
var Q = require('q');

exports.Content = class Content {
  constructor(id, typeId, title_en, title_ja, iconPath) {
    this.id = id;
    this.typeId = typeId;
    this.title_en = title_en;
    this.title_ja = title_ja;
    this.iconPath = iconPath;
  }

  getId() {
    return this.id;
  }

  getTypeId() {
    return this.typeId;
  }

  getTitle_en() {
    return this.title_en;
  }

  getTitle_ja() {
    return this.title_ja
  }

  getIconPath() {
    return this.iconPath;
  }

  // static functions
  static selectAll() {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query("SELECT * FROM content;", function (err, rows, fields) {

      if (rows.length) {
        var models = [];
        __.each(rows, function (row) {
          models.push(new Content(
            row["id"],
            row["type"],
            row["title_en"],
            row["title_ja"],
            row["icon_path"]
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
