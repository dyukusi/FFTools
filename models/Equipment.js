var appRoot = require('app-root-path');
var Equipment = require(appRoot + '/models/Equipment.js').Equipment;
var db = require(appRoot + '/my_node_libs/db.js');
var Q = require('q');

exports.Equipment = class Equipment {
  constructor(id, typeId, nameEng, nameJP, imageURL) {
    this.id = id;
    this.typeId = typeId;
    this.nameEng = nameEng;
    this.nameJP = nameJP;
    this.imageURL = imageURL;
  }

  getId() {
    return this.id;
  }

  getEquipmentTypeId() {
    return this.typeId;
  }

  getNameEng() {
    return this.nameEng;
  }

  getNameJP() {
    return this.nameJP;
  }

  getImageURL() {
    return this.imageURL;
  }

  // static functions
  static rowToModel(row) {
    return new Equipment(
      row["id"],
      row["type_id"],
      row["name_en"],
      row["name_jp"],
      row["image_url"],
    );
  }

  static selectByIds(ids) {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query("SELECT * FROM equipment WHERE id IN (?)",
      [ids],
      function (err, rows, fields) {
        if (rows.length) {
          var models = [];
          __.each(rows, function (row) {
            models.push(Equipment.rowToModel(row));
          });

          d.resolve(models);
        }

        con.end();
      });

    return d.promise;
  }

  static selectAll() {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query("SELECT * FROM equipment", function (err, rows, fields) {
      if (err) {
        throw new Error(err);
        return;
      }

      var models = [];
      __.each(rows, function (row) {
        models.push(Equipment.rowToModel(row));
      });

      d.resolve(models);
      con.end();
    });

    return d.promise;
  }

  static searchByNameJP(keyword, options) {
    var d = Q.defer();

    var sql = 'SELECT * FROM equipment WHERE name_jp LIKE ?';
    var placeHolderArray = ['%' + keyword + '%'];

    if (options) {
      if (options.targetEquipmentTypeId) {
        sql += ' AND type_id = ? ';
        placeHolderArray.push(options.targetEquipmentTypeId);
      }
    }

    sql += ' LIMIT 30';

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query(sql, placeHolderArray,
      function (err, rows, fields) {
        if (err) {
          debugger;
          throw new Error(err);
          return;
        }

        var models = [];
        __.each(rows, function (row) {
          models.push(Equipment.rowToModel(row));
        });

        d.resolve(models);
        con.end();
      });

    return d.promise;
  }

}
