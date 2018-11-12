var appRoot = require('app-root-path');
var SnapshotViewHistory = require(appRoot + '/models/SnapshotViewHistory.js').SnapshotViewHistory;
var db = require(appRoot + '/my_node_libs/db.js');
var Q = require('q');

exports.SnapshotViewHistory = class SnapshotViewHistory {
  constructor(snapshotId, previousViewIP, count) {
    this.snapshotId = snapshotId;
    this.previousViewIP = previousViewIP;
    this.count = count;
  }

  getSnapshotId() {
    return this.snapshotId;
  }

  getPreviousViewIP() {
    return this.previousViewIP;
  }

  getCount() {
    return this.count;
  }

  // static functions
  static rowToModel(row) {
    return new SnapshotViewHistory(
      row["snapshot_id"],
      row["previous_view_ip"],
      row["count"],
    );
  }

  static selectAndIncrementCountIfNeed(snapshotId, ip) {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query("SELECT * FROM snapshot_view_history WHERE snapshot_id = ?;",
      [Number(snapshotId)],
      function (err, rows, fields) {
        if (err) {
          console.log(err);
          d.reject(err);
          con.end();
          return;
        }

        if (rows.length) {
          var model = SnapshotViewHistory.rowToModel(rows[0]);

          if (model.getPreviousViewIP() == ip) {
            d.resolve(model);
            con.end();
            return;
          }
        }

        con.query(
          "INSERT INTO snapshot_view_history VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE count = count + 1, previous_view_ip = ?",
          [snapshotId, ip, ip],
          function (error, results, fields) {
            if (error) {
              console.log(error);
              d.reject(error);
              con.end();
              return;
            }

            con.query("SELECT * FROM snapshot_view_history WHERE snapshot_id = ?;",
              [Number(snapshotId)],
              function (err, rows, fields) {
                if (err) {
                  console.log(err);
                  d.reject(err);
                  con.end();
                  return;
                }

                d.resolve(SnapshotViewHistory.rowToModel(rows[0]));
                con.end();
                return;
              });
          }
        );

      });

    return d.promise;

  }
}
