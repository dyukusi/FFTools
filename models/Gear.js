var appRoot = require('app-root-path');
var Gear = require(appRoot + '/models/Gear.js').Gear;
var db = require(appRoot + '/my_node_libs/db.js');
var Q = require('q');

exports.Gear = class Gear {
  constructor(snapshotId, typeId, equipmentId, mirageEquipmentId, dyeId, creatorUserId, materiaId1, materiaId2, materiaId3, materiaId4, materiaId5) {
    this.snapshotId = snapshotId;
    this.typeId = typeId;
    this.equipmentId = equipmentId;
    this.mirageEquipmentId = mirageEquipmentId;
    this.dyeId = dyeId;
    this.creatorUserId = creatorUserId;
    this.materiaId1 = materiaId1;
    this.materiaId2 = materiaId2;
    this.materiaId3 = materiaId3;
    this.materiaId4 = materiaId4;
    this.materiaId5 = materiaId5;
  }

  getSnapshotId() {
    return this.snapshotId;
  }

  getEquipmentTypeId() {
    return this.typeId;
  }

  getEquipmentId() {
    return this.equipmentId;
  }

  getMirageEquipmentId() {
    return this.mirageEquipmentId;
  }

  getDyeId() {
    return this.dyeId;
  }

  getCreatorUserId() {
    return this.creatorUserId;
  }

  getMateriaId1() {
    this.materiaId1;
  }

  getMateriaId2() {
    this.materiaId2;
  }

  getMateriaId3() {
    this.materiaId3;
  }

  getMateriaId4() {
    this.materiaId4;
  }

  getMateriaId5() {
    this.materiaId5;
  }

  // static functions
  static rowToModel(row) {
    return new Gear(
      row["snapshot_id"],
      row["type_id"],
      row["equipment_id"],
      row["mirage_equipment_id"],
      row["dye_id"],
      row["creator_user_id"],
      row["materia_id_1"],
      row["materia_id_2"],
      row["materia_id_3"],
      row["materia_id_4"],
      row["materia_id_5"],
    );
  }

  static selectBySnapshotId(snapshotId) {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query(
      "SELECT * FROM gear WHERE snapshot_id = ?",
      [snapshotId],
      function (err, rows, fields) {
        if (err) {
          console.log(err);
          return;
        }

        if (rows.length) {
          var results = [];
          __.each(rows, function (row) {
            results.push(Gear.rowToModel(row));
          });

          d.resolve(results);
        }

        con.end();
      });

    return d.promise;
  }

  static selectSnapshotIdsForSearchGearSet(options) {
    var d = Q.defer();
    var ROW_NUM_PER_PAGE = 50;

    var sql = 'SELECT DISTINCT snapshot_id FROM gear JOIN character_snapshot ON gear.snapshot_id = character_snapshot.id WHERE true';
    var placeHolder = [];
    var limitFrom = options.page ? options.page * ROW_NUM_PER_PAGE : 0;

    if (options.mirageEquipmentId && options.mirageEquipmentId != 'all') {
      sql += ' AND mirage_equipment_id = ? ';
      placeHolder.push(options.mirageEquipmentId);
    }

    if (options.gender) {
      sql += ' AND gender_id = ? ';
      placeHolder.push(options.gender);
    }

    if (options.race) {
      sql += ' AND race_id = ? ';
      placeHolder.push(options.race);
    }

    if (options.job) {
      sql += ' AND job_id = ? ';
      placeHolder.push(options.job);
    }

    sql += ' LIMIT ?, ?; ';
    placeHolder.push(limitFrom, ROW_NUM_PER_PAGE);

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query(sql, placeHolder,
      function (err, rows, fields) {
        if (err) {
          console.log(err);
          return;
        }

        var snapshotIds = __.map(rows, function(row) {
          return row.snapshot_id;
        });

        d.resolve({
          hasNextPage: rows.length >= ROW_NUM_PER_PAGE,
          snapshotIds: snapshotIds,
        });
        con.end();
      });

    return d.promise;
  }

  static selectEquipmentIdAndCountForMirageRankingTop10ByTypeNameEng(typeNameEng) {
    var d = Q.defer();

    var targetTypeId = EquipmentTypeCollection.getModelByTypeNameEng(typeNameEng).getId();
    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query(
      "SELECT mirage_equipment_id, COUNT(mirage_equipment_id) AS count FROM gear WHERE type_id = ? GROUP BY mirage_equipment_id ORDER BY count DESC LIMIT 10",
      [targetTypeId],
      function (err, rows, fields) {
        if (err) {
          console.log(err);
          return;
        }

        if (rows.length) {
          var results = [];
          __.each(rows, function (row) {
            results.push([row.mirage_equipment_id, row.count]);
          });

          d.resolve(results);
        } else {
          d.reject("could not find records");
        }

        con.end();
      });

    return d.promise;
  }

  static selectForMirageRankingDetail(options) {
    var d = Q.defer();

    var sql = 'SELECT gear.mirage_equipment_id, equipment.type_id, equipment.name_en, equipment.name_jp, COUNT(mirage_equipment_id) AS count FROM gear JOIN character_snapshot ON gear.snapshot_id = character_snapshot.id JOIN equipment ON gear.mirage_equipment_id = equipment.id WHERE true ';
    var placeHolder = [];

    if (options.equipmentTypeId) {
      sql += ' AND gear.type_id = ? ';
      placeHolder.push(options.equipmentTypeId);
    }

    if (options.serverId) {
      sql += ' AND server_id = ? ';
      placeHolder.push(options.serverId);
    }

    if (options.jobId) {
      sql += ' AND job_id = ? ';
      placeHolder.push(options.jobId);
    }

    if (options.gender_id) {
      sql += ' AND gender_id = ? ';
      placeHolder.push(options.genderId);
    }

    if (options.raceId) {
      sql += ' AND race_id = ? ';
      placeHolder.push(options.raceId);
    }

    sql += ' GROUP BY mirage_equipment_id ORDER BY count DESC LIMIT 50;';

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query(sql, placeHolder,
      function (err, rows, fields) {
        if (err) {
          console.log(err);
          return;
        }

        if (rows.length) {
          var results = [];
          __.each(rows, function (row) {
            results.push([row.mirage_equipment_id, row.type_id, row.name_en, row.name_jp, row.count]);
          });

          d.resolve(results);
        } else {
          d.reject("could not find records");
        }

        con.end();
      });

    return d.promise;
  }

}
