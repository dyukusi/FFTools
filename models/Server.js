var appRoot = require('app-root-path');
var Server = require(appRoot + '/models/Server.js').Server;
var db = require(appRoot + '/my_node_libs/db.js');
var Q = require('q');

exports.Server = class Server {
  constructor(id, dcId, name) {
    this.id = id;
    this.dcId = dcId;
    this.name = name;
  }

  getId() {
    return this.id;
  }

  getDcId() {
    return this.dcId;
  }

  getName() {
    return this.name;
  }

  // static functions
  static selectAll() {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query("SELECT * FROM server;", function (err, rows, fields) {
      if (err) {
        throw new Error(err);
        return;
      }

      if (rows.length) {
        var models = [];
        __.each(rows, function (row) {
          models.push(new Server(
            row["id"],
            row["dc_id"],
            row["name"],
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
