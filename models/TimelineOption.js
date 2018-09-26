var appRoot = require('app-root-path');
var TimelineOption = require(appRoot + '/models/TimelineOption.js').TimelineOption;
var db = require(appRoot + '/my_node_libs/db.js');
var Q = require('q');

exports.TimelineOption = class TimelineOption {
  constructor(timelineId, optionId) {
    this.timelineId = timelineId;
    this.optionId = optionId;
  }

  getTimelineId() {
    return this.timelineId
  }

  getOptionId() {
    return this.optionId;
  }

  // static functions
  static selectByTimelineId(timelineId) {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query("SELECT * FROM timeline_option WHERE timeline_id = ?", [timelineId], function (err, rows, fields) {
      var models = [];

      if (rows.length) {
        __.each(rows, function (row) {
          models.push(new TimelineOption(
            row["timeline_id"],
            row["option_id"],
          ));
        });
      }

      d.resolve(models);
      con.end();
    });

    return d.promise;
  }
}
