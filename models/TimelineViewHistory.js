var appRoot = require('app-root-path');
var TimelineViewHistory = require(appRoot + '/models/TimelineViewHistory.js').TimelineViewHistory;

exports.TimelineViewHistory = class TimelineViewHistory {
  constructor(ip, timelineId) {
    this.ip = ip;
    this.timelineId = timelineId;
  }

  getIp() {
    return this.ip;
  }

  getTimelineId() {
    return this.timelineId;
  }

  // static functions
  // static existsByIpAndTimelineId(ip, timelineId) {
  //   var d = Q.defer();
  //
  //   var con = db.connect(constants.FFXIV_TM_DB_NAME).con;
  //   con.query("SELECT timeline_id FROM timeline_view_history WHERE ip = ? AND timelineId = ?",
  //     [ip, timelineId],
  //     function (err, rows, fields) {
  //
  //     if (rows.length) {
  //       d.resolve(true);
  //     } else {
  //       d.resolve(false);
  //     }
  //
  //     con.end();
  //   });
  //
  //   return d.promise;
  // }
  //
  // static insert(ip, timelineId) {
  //   var d = Q.defer();
  //
  //   var con = db.connect(constants.FFXIV_TM_DB_NAME).con;
  //
  //   con.query(
  //     "INSERT IGNORE INTO timeline_view_history SET ?",
  //     {
  //       ip: ip,
  //       timeline_id: timelineId,
  //     },
  //     function (error, results, fields) {
  //       if (error) {
  //         console.log(error.stack);
  //         d.reject("DB problem");
  //
  //         return;
  //       }
  //
  //       d.resolve(results.affectedRows);
  //
  //       con.end();
  //     }
  //   );
  //
  //   return d.promise;
  // }
}
