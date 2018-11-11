var appRoot = require('app-root-path');
var EquipmentType = require(appRoot + '/models/EquipmentType.js').EquipmentType;
var db = require(appRoot + '/my_node_libs/db.js');
var Q = require('q');

exports.EquipmentType = class EquipmentType {
  constructor(id, nameEng, nameJP) {
    this.id = id;
    this.nameEng = nameEng;
    this.nameJP = nameJP;
  }

  getId() {
    return this.id;
  }

  getNameEng() {
    return this.nameEng;
  }

  getNameJP() {
    return this.nameJP;
  }

  // static functions
  static selectAll() {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query("SELECT * FROM equipment_type;", function (err, rows, fields) {
      if (err) {
        throw new Error(err);
        return;
      }

      if (rows.length) {
        var models = [];
        __.each(rows, function (row) {
          models.push(new EquipmentType(
            row["id"],
            row["name_en"],
            row["name_jp"],
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
