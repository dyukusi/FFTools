var appRoot = require('app-root-path');
var TimelineEvent = require(appRoot + '/models/TimelineEvent.js').TimelineEvent;
var db = require(appRoot + '/my_node_libs/db.js');
var Q = require('q');

exports.TimelineEvent = class TimelineEvent {
  constructor(timelineId, row, column, text) {
    this.timelineId = timelineId;
    this.row = row;
    this.column = column;
    this.text = text;
  }

  getTimelineId() {
    return this.timelineId
  }

  getRow() {
    return this.row;
  }

  getColumn() {
    return this.column;
  }

  getText() {
    return this.text;
  }

  // static functions
  static selectByTimelineId(timelineId) {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query("SELECT * FROM timeline_event WHERE timeline_id = ?", [timelineId], function (err, rows, fields) {
      var models = [];

      if (rows.length) {
        __.each(rows, function (row) {
          models.push(new TimelineEvent(
            row["timeline_id"],
            row["row"],
            row["column"],
            row["text"],
          ));
        });
      }

      d.resolve(models);
      con.end();
    });

    return d.promise;
  }
}
