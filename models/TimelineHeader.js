var appRoot = require('app-root-path');
var TimelineHeader = require(appRoot + '/models/TimelineHeader.js').TimelineHeader;
var db = require(appRoot + '/my_node_libs/db.js');
var Q = require('q');

exports.TimelineHeader = class TimelineHeader {
  constructor(timelineId, dispOrder, text, columnWidthPercentage) {
    this.timelineId = timelineId;
    this.dispOrder = dispOrder;
    this.text = text;
    this.column_width_percentage = columnWidthPercentage;
  }

  getTimelineId() {
    return this.timelineId
  }

  getDispOrder() {
    return this.dispOrder;
  }

  getText() {
    return this.text;
  }

  getColumnWidthPercentage() {
    return this.column_width_percentage;
  }

  // static functions
  static insert(timelineId, dispOrder, text, columnWidthPercentage) {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;

    con.query(
      "INSERT INTO timeline_header SET ?",
      {
        timeline_id: timelineId,
        disp_order: dispOrder,
        text: text,
        column_width_percentage: columnWidthPercentage
      },
      function (error, results, fields) {
        if (error) {
          console.log(error.stack);
          d.reject("DB problem");

          return;
        }

        d.resolve();

        con.end();
      }
    );
  }


  static selectByTimelineId(timelineId) {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query("SELECT * FROM timeline_header WHERE timeline_id = ?", [timelineId], function (err, rows, fields) {
      var models = [];

      if (rows.length) {
        __.each(rows, function (row) {
          models.push(new TimelineHeader(
            row["timeline_id"],
            row["disp_order"],
            row["text"],
            row["column_width_percentage"]
          ));
        });
      }

      d.resolve(models);
      con.end();
    });

    return d.promise;
  }
}
