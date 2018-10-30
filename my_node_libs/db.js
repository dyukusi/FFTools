var mysql = require('mysql');
var appRoot = require('app-root-path');

function connect(dbName) {
  var error;

  var con = mysql.createConnection({
    host: MyConst.DB.HOST,
    user: MyConst.DB.USER,
    password: MyConst.DB.PASSWORD,
    database: dbName,
  });

  con.connect(function (err) {
    if (err) {
      error = err;
      console.error('error connecting: ' + err.stack);
      return;
    }

    console.log('connected as id ' + con.threadId);
  });

  return {
    con: con,
    err: error,
  };
}

exports.connect = connect;
