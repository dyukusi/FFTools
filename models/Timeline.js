var appRoot = require('app-root-path');
var db = require(appRoot + '/my_node_libs/db.js');
var crypt = require(appRoot + '/my_node_libs/crypt.js');
var Timeline = require(appRoot + '/models/Timeline.js').Timeline;
var crc32 = require('crc32');
var Q = require('q');

exports.Timeline = class Timeline {
  constructor(id, idHash, userId, contentId, title, password, youtubeVideoId, videoLength, language, views, favorite, isDeleted, updatedAt, createdAt) {
    this.id = id;
    this.idHash = idHash;
    this.userId = userId;
    this.contentId = contentId;
    this.title = title;
    this.password = password;
    this.youtubeVideoId = youtubeVideoId;
    this.videoLength = videoLength;
    this.language = language;
    this.views = views;
    this.favorite = favorite;
    this.isDeleted = isDeleted;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;

    this.name = null;
    this.charThumbnailUrl = null;
  }

  getId() {
    return this.id;
  }

  getUserId() {
    return this.userId;
  }

  getCreatorName() {
    return this.name;
  }

  setCreatorName(name) {
    this.name = name;
  }

  getCharacterThumbnailUrl() {
    return this.charThumbnailUrl;
  }

  setCharThumbnailUrl(charThumbnailUrl) {
    this.charThumbnailUrl = charThumbnailUrl;
  }

  getIdHash() {
    return this.idHash;
  }

  getContentId() {
    return this.contentId;
  }

  getTitle() {
    return this.title;
  }

  getPassword() {
    return this.password;
  }

  getYoutubeVideoId() {
    return this.youtubeVideoId;
  }

  getVideoLength() {
    return this.videoLength;
  }

  getLanguage() {
    return this.language;
  }

  getViews() {
    return this.views;
  }

  getFavorite() {
    return this.favorite;
  }

  getIsDeleted() {
    return this.isDeleted;
  }

  getUpdatedAt() {
    return this.updatedAt;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  // static functions
  static updateIsDeletedFlagByIdHash(idHash, isDeleted) {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query(
      "UPDATE timeline SET is_deleted = ? WHERE id_hash = ?",
      [isDeleted, idHash],
      function (error, results, fields) {
        if (error) {
          d.reject();
          throw new Error(error);
        }

        d.resolve();
        con.end();
      }
    );

    return d.promise;
  }

  static rowToTimelineModel(row) {
    return new Timeline(
      row["id"],
      row["id_hash"],
      row["user_id"],
      row["content_id"],
      row["title"],
      row["password"],
      row["youtube_video_id"],
      row["video_length"],
      row["language"],
      row["views"],
      row["favorite"],
      row["is_deleted"],
      row["updated_at"],
      row["created_at"],
    );
  }

  static selectById(id) {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query("SELECT * FROM timeline WHERE id = ?", [id], function (err, rows, fields) {

      if (rows.length) {
        var row = rows[0];
        d.resolve(Timeline.rowToTimelineModel(row));

      } else {
        d.reject("could not find records");
      }

      con.end();
    });

    return d.promise;
  }

  static selectByIdHash(idHash) {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query("SELECT * FROM timeline WHERE id_hash = ?", [idHash], function (err, rows, fields) {
      if (rows.length) {
        var row = rows[0];
        d.resolve(Timeline.rowToTimelineModel(row));

      } else {
        d.reject("could not find timeline. id_hash: " + idHash);
      }

      con.end();
    });

    return d.promise;
  }

  static selectForPagenation(start, num, options) {
    var d = Q.defer();
    var sqlBase = 'SELECT timeline.*, user.name as user_name, user.char_thumbnail_url FROM timeline JOIN user ON timeline.user_id = user.id WHERE timeline.updated_at IS NOT NULL AND timeline.is_deleted != 1 ';
    var whereSQL = '';
    var orderBySQL = '';
    var phPars = [];

    // conditions
    if (options["content_id"]) {
      whereSQL += ' AND timeline.content_id = ? ';
      phPars.push(options["content_id"]);
    }

    if (options["user_id"]) {
      whereSQL += ' AND timeline.user_id = ? ';
      phPars.push(options["user_id"]);
    }

    if (options["title"]) {
      whereSQL += ' AND MATCH(timeline.title) AGAINST(?) ';
      phPars.push(options["title"]);
    }

    if (options['order_by']) {
      var ascOrDesc = ' DESC ';
      var isAsc = options['is_asc'] ? true : false;
      if (isAsc) {
        ascOrDesc = ' ASC ';
      }

      orderBySQL = 'ORDER BY ?? ' + ascOrDesc;
      phPars.push(options['order_by']);
    }

    var sql = sqlBase + whereSQL + orderBySQL + ' LIMIT ?, ? ';
    phPars = __.flatten([phPars, [start, num + 1]]);  // +1 for calc hasNext

    console.log(sql);

    var con = db.connect(MyConst.DB.DATABASE).con;
    con.query(sql, phPars, function (err, rows, fields) {
      if (err) {
        throw new Error(err);
      }

      var hasNext = false;

      if (rows && rows.length > num) {
        hasNext = true;
        rows.pop();
      }

      var models = [];
      __.each(rows, function (row) {
        var m = Timeline.rowToTimelineModel(row);
        m.setCreatorName(row["user_name"]);
        m.setCharThumbnailUrl(row["char_thumbnail_url"]);

        models.push(m);
      });

      if (models.length) {
        d.resolve({
          timeline_models: models,
          has_next: hasNext,
        });
      } else {
        d.reject("could not find records");
      }

      con.end();
    });

    return d.promise;
  }


  static insert(userId, contentId, title, password, youtubeVideoId, videoLength, language) {
    var d = Q.defer();

    var con = db.connect(MyConst.DB.DATABASE).con;
    var hashedPassword = crypt.hashed(password);

    con.beginTransaction(function (err) {
      if (err) {
        throw new Error(err);
      }

      async.waterfall([
        function (callback) {
          con.query(
            "INSERT INTO timeline SET ?",
            {
              user_id: userId,
              content_id: contentId,
              title: title,
              password: hashedPassword,
              youtube_video_id: youtubeVideoId,
              video_length: videoLength,
              language: language,
              is_deleted: 0,
            },
            function (error, results, fields) {
              if (error) {
                callback(error);
                return;
              }

              var timelineId = results.insertId;
              callback(null, timelineId);
            }
          );
        },

        function (timelineId, callback) {
          var generateIdHash = function () {
            var randomInt = generateRandomInt(1, 4000000000);
            var idHash = crc32(randomInt + '');

            con.query(
              "SELECT * FROM timeline WHERE id_hash = ?",
              [idHash],
              function (error, rows, fields) {
                if (error) {
                  callback(error);
                  return;
                }

                if (rows.length) {
                  generateIdHash();
                } else {
                  callback(null, timelineId, idHash);
                }

              }
            );
          };

          generateIdHash();
        },

        function (timelineId, idHash, callback) {
          con.query(
            "UPDATE timeline SET id_hash = ? WHERE id = ?",
            [idHash, timelineId],
            function (error, results, fields) {
              if (error) {
                callback(error);
                return;
              }

              callback(null, timelineId, idHash);
            }
          );
        },

        function (timelineId, idHash, callback) {
          con.query(
            "INSERT INTO timeline_header SET ?",
            {
              timeline_id: timelineId,
              disp_order: 1,
              text: "New Column", // TODO 多言語対応
              column_width_percentage: 200,
            },
            function (error, results, fields) {
              if (error) {
                callback(error);
                return;
              }

              callback(null, idHash);
            }
          );
        },

        function (idHash, callback) {
          con.commit(function (error) {
            if (err) {
              callback(error);
              return;
            }

            callback(null, idHash);
          });
        },

      ], function (error, idHash) {
        if (error) {
          con.rollback(function (err) {
            if (err) {
              throw new Error(err);
            }

            throw new Error(error);
          });
        } else {
          d.resolve(idHash);
        }

        con.end();
      });

    });

    return d.promise;
  }

  static updateByIdHash(idHash, timeline, colHeader, colWidthPercentages) {
    var d = Q.defer();
    var con = db.connect(MyConst.DB.DATABASE).con;

    con.beginTransaction(function (err) {
      if (err) {
        throw err;
      }

      async.waterfall([
        // search ID by ID hash
        function (callback) {
          con.query(
            "SELECT * FROM timeline WHERE id_hash = ?",
            [idHash],
            function (error, rows, fields) {
              if (error) {
                callback({error: error,});
              }

              var row = rows[0];
              callback(null, {
                id: row["id"],
              });
            });
        },

        // DELETE TimelineEvent
        function (arg, callback) {
          con.query(
            "DELETE FROM timeline_event WHERE timeline_id = ?",
            [arg["id"]],
            function (error, results, fields) {
              if (error) {
                callback({error: error,});
              }

              callback(null, arg);
            });
        },

        // DELETE TimelineHeader
        function (arg, callback) {
          con.query(
            "DELETE FROM timeline_header WHERE timeline_id = ?",
            [arg["id"]],
            function (error, results, fields) {
              if (error) {
                callback({error: error,});
              }

              callback(null, arg);
            });
        },

        // INSERT TimelineEvent
        function (arg, callback) {
          // make for bulk insert
          var insertData = [];
          for (var row = 0; row < timeline.length; row++) {
            for (var col = 0; col < timeline[0].length; col++) {
              var text = timeline[row][col];

              if (!__.isEmpty(text)) {
                insertData.push([
                  arg["id"],
                  row,
                  col,
                  timeline[row][col]
                ]);
              }

            }
          }

          con.query(
            "INSERT INTO timeline_event VALUES ?",
            [insertData],
            function (error, results, fields) {
              if (error) {
                callback({error: error,});
              }

              callback(null, arg);
            }
          );
        },

        // Insert TimelineHeader
        function (arg, callback) {
          var insertData = [];
          __.times(colHeader.length, function (dispOrder) {
            insertData.push([
              arg["id"],
              dispOrder,
              colHeader[dispOrder],
              colWidthPercentages[dispOrder]
            ]);
          });

          con.query(
            "INSERT INTO timeline_header VALUES ?",
            [insertData],
            function (error, results, fields) {
              if (error) {
                callback({error: error,});
              }

              callback(null, arg);
            }
          );
        },

        // UPDATE timeline's updated_at
        function (arg, callback) {
          con.query(
            "UPDATE timeline SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [arg["id"]],
            function (error, results, fields) {
              if (error) {
                callback({error: error,});
              }

              callback(null);
            }
          );
        },

        function (callback) {
          con.commit(function (error) {
            if (err) {
              callback({error: error,});
            }

            callback(null);
          });

        }

      ], function (err) {
        if (err) {
          con.rollback(function () {
            throw err;
          });

          d.reject("DB problem");
        } else {
          d.resolve();
        }
      });

    });

    return d.promise;
  }

  static incremenetViewsByIPandTimelineId(ip, timelineId) {
    var d = Q.defer();
    var con = db.connect(MyConst.DB.DATABASE).con;

    con.query(
      "SELECT * from timeline_view_history WHERE ip = ? AND timeline_id = ? AND DATE_ADD(created_at, INTERVAL 1 DAY) > NOW()",
      [ip, timelineId]
      , function (err, rows, fields) {
        if (err) {
          throw new Error(err);
          return;
        }

        if (rows && rows.length) {
          d.resolve();
          con.end();
          return;
        }

        con.beginTransaction(function (err) {
          if (err) {
            throw err;
          }

          async.waterfall([
            function (callback) {
              con.query(
                "INSERT INTO timeline_view_history SET ?",
                {
                  ip: ip,
                  timeline_id: timelineId,
                },
                function (error, results, fields) {
                  if (error) {
                    callback(error);
                    return;
                  }

                  callback(null);
                }
              );
            },

            function (callback) {
              con.query(
                "UPDATE timeline SET views = views + 1 WHERE id = ?",
                [timelineId],
                function (error, results, fields) {
                  if (error) {
                    callback(error);
                    return;
                  }

                  callback(null);
                }
              );
            },

            function (callback) {
              con.commit(function (error) {
                if (error) {
                  callback(error);
                  return;
                }

                callback(null);
              });
            }

          ], function (err) {
            if (err) {
              d.reject("db problem");
              con.rollback(function () {
                throw new Error(err);
              });
            } else {
              d.resolve();
            }

            con.end();
          });


        });

      });

    return d.promise;
  }

}

function generateRandomInt(min, max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}
