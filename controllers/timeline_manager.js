var appRoot = require('app-root-path');
var express = require('express');
var router = express.Router();
var request = require('request');
var requestIp = require('request-ip');
var User = require(appRoot + '/models/User.js').User;
var Timeline = require(appRoot + '/models/Timeline.js').Timeline;
var Report = require(appRoot + '/models/Report.js').Report;
var TimelineHeader = require(appRoot + '/models/TimelineHeader.js').TimelineHeader;
var TimelineEvent = require(appRoot + '/models/TimelineEvent.js').TimelineEvent;
var TimelineOption = require(appRoot + '/models/TimelineOption.js').TimelineOption;
var TimelineViewHistory = require(appRoot + '/models/TimelineViewHistory.js').TimelineViewHistory;
var crypt = require(appRoot + '/my_node_libs/crypt.js');
var validator = require('validator');

router.get('/', function (req, res, next) {
  res.render('timeline_manager/index', {title: 'FFXIV Timeline Manager'});
});

router.post('/report/:timeline_id_hash', function (req, res, next) {
  var par = req.params;
  var json = req.body;
  var timelineIdHash = par["timeline_id_hash"];
  var email = json['email'];
  var text = json['text'];
  var resJson = {
    success: false,
  };

  async.waterfall([
    function (callback) {
      Timeline.selectByIdHash(timelineIdHash)
        .then(function (tModel) {
          callback(null);
        })
        .fail(function (error) {
          callback(error);
        });
    },

    function (callback) {
      var encryptedEmail = crypt.encrypt(email);

      Report.insert(timelineIdHash, encryptedEmail, text)
        .then(function () {
          callback(null);
        })
        .fail(function (error) {
          callback(error);
        });
      ;
    },

  ], function (error) {
    if (error) {
      res.send(resJson);
      throw new Error(error);
    }

    resJson.success = true;
    res.send(resJson);
  });

});

router.post('/delete/:timeline_id_hash', function (req, res, next) {
  var par = req.params;
  var userId = req.session.user_id;
  var isLogin = !!userId;

  var json = req.body;
  var timelineIdHash = par["timeline_id_hash"];
  var timelineAdminPassword = json['tl_admin_password'];
  var resJson = {
    success: false,
  };

  Timeline.selectByIdHash(timelineIdHash)
    .then(function (timelineModel) {
      if (
        (timelineAdminPassword && timelineModel.getPassword() == crypt.hashed(timelineAdminPassword))
        || (isLogin && userId == timelineModel.getUserId())
      ) {
        Timeline.updateIsDeletedFlagByIdHash(timelineIdHash, 1)
          .then(function (result) {
            resJson.success = true;
          })
          .fail(function (err) {
            throw new Error(err);
          })
          .done(function () {
            res.send(resJson);
          });
      } else {
        res.send(resJson);
      }
    });

});

router.get('/check_owner/:timeline_id_hash', function (req, res, next) {
  var par = req.params;
  var timelineIdHash = par["timeline_id_hash"];
  var userId = req.session.user_id;
  var isLogin = !!userId;

  async.waterfall([
    function (callback) {
      Timeline.selectByIdHash(timelineIdHash)
        .then(function (tModel) {
          callback(null, tModel);
        })
        .fail(function (error) {
          callback({error: error,});
        });
    },

    function (timelineModel, callback) {
      User.selectById(timelineModel.getUserId())
        .then(function (userModel) {
          callback(null, timelineModel, userModel);
        })
        .fail(function (error) {
          callback({error: error,});
        });
    },
  ], function (error, timelineModel, userModel) {
    if (error) {
      throw new Error(error);
    }
    var ownerUserId = userModel.getId();

    res.send({
      is_owner: isLogin && userId == ownerUserId,
      owner_name: userModel.getName(),
      owner_char_thumbnail_url: userModel.getCharacterThumbnailUrl(),
    });
  });

});

router.get('/search', function (req, res, next) {
  var par = req.query;
  var order_res = orderTypeToQueryParam(par["order_type"]);

  Timeline.selectForPagenation(Number(par["start"]), 50,
    {
      content_id: Number(par["content_id"]),
      user_id: Number(par["user_id"]),
      title: par["title"],
      order_by: order_res.order_by,
      is_asc: order_res.is_asc,
    }
  ).then(function (result) {

    var timelines = [];
    __.each(result["timeline_models"], function (m) {
      timelines.push({
        id_hash: m.getIdHash(),
        user: {
          id: m.getUserId(),
          name: m.getCreatorName(),
          char_thumbnail_url: m.getCharacterThumbnailUrl(),
        },
        content_id: m.getContentId(),
        title: m.getTitle(),
        language: m.getLanguage(),
        views: m.getViews(),
        favorite: m.getFavorite(),
        updated_at: m.getUpdatedAt(),
      });
    });

    var resMap = {
      timelines: timelines,
      has_next: result["has_next"],
    };

    res.send(resMap);
  }).fail(function (error) {
    res.send({
      timelines: [],
      has_next: false,
    });
  });

});

router.get('/edit/:timeline_id_hash', function (req, res, next) {
  var par = req.params;
  var ip = requestIp.getClientIp(req);
  var timelineIdHash = par["timeline_id_hash"];

  async.waterfall([
    function (callback) {
      Timeline.selectByIdHash(timelineIdHash)
        .then(function (timelineModel) {
          callback(null, timelineModel);
        })
        .fail(function (error) {
          callback(error);
          return;
        });
    },

    function (timelineModel, callback) {
      User.selectById(timelineModel.getUserId())
        .then(function (userModel) {
          callback(null, timelineModel, userModel);
        })
        .fail(function (error) {
          callback(error);
          return;
        });
    }


  ], function (error, timelineModel, userModel) {
    if (error) {
      throw new Error(error);
    }

    if (!timelineModel.getIsDeleted()) {
      res.render('timeline_manager/edit', {
        timelineModel: timelineModel,
        creatorUserModel: userModel,
      });

      // views count
      Timeline.incremenetViewsByIPandTimelineId(ip, timelineModel.getId());
    }
    // deleted timeline
    else {
      res.render('timeline_manager/deleted', {});
    }

  });

});

// submit timeline
router.post('/edit/:timeline_id_hash', function (req, res, next) {
  var par = req.params;
  var userId = req.session.user_id;
  var isLogin = !!userId;

  var json = req.body;
  var timelineIdHash = par["timeline_id_hash"];
  var timelineAdminPassword = json['tl_admin_password'];
  var resJson = {
    success: false,
  };

  Timeline.selectByIdHash(timelineIdHash)
    .then(function (timelineModel) {
      if (
        (timelineAdminPassword && timelineModel.getPassword() == crypt.hashed(timelineAdminPassword))
        || (isLogin && userId == timelineModel.getUserId())
      ) {
        Timeline.updateByIdHash(timelineIdHash, json["timeline"], json["col_header"], json["col_width_percentages"], json["timeline_option"], json["timeline_title"])
          .then(function (result) {
            resJson.success = true;
          })
          .fail(function (err) {
            throw new Error(err);
          })
          .done(function () {
            res.send(resJson);
          });
      } else {
        res.send(resJson);
      }
    });

});


router.get('/new', function (req, res, next) {
  res.render('timeline_manager/new', {
    __: __,
    title: 'Create new Timeline',
  });
});

router.get('/get/:timeline_id_hash', function (req, res, next) {
  var par = req.params;
  var timelineIdHash = par["timeline_id_hash"];

  async.waterfall([
    function (callback) {
      Timeline.selectByIdHash(timelineIdHash)
        .then(function (tModel) {
          callback(null, tModel);
        })
        .fail(function (error) {
          callback({error: error,});
        });
    },

    function (tModel, callback) {
      Q.allSettled([
        TimelineHeader.selectByTimelineId(tModel.getId()),
        TimelineEvent.selectByTimelineId(tModel.getId()),
        TimelineOption.selectByTimelineId(tModel.getId()),
      ])
        .then(function (results) {
          var headerModels = results[0].value;
          var eventModels = results[1].value;
          var optionModels = results[2].value;

          var contentModel = ContentCollection.getModelById(tModel.getContentId());

          // generate header array
          var headers = [];
          var sortedHeaderModels = __.sortBy(headerModels, function (m) {
            return m.getDispOrder();
          });
          __.each(sortedHeaderModels, function (m) {
            headers.push({
              text: m.getText(),
              column_width_percentage: m.getColumnWidthPercentage(),
            });
          });

          // generate timeline
          var tArray = MyUtil.create2dimensionEmptyArray(tModel.getVideoLength(), headers.length);
          __.each(eventModels, function (m) {
            tArray[m.getRow()][m.getColumn()] = m.getText();
          });

          // option ids
          var optionIds = __.map(optionModels, function(m) {
            return m.getOptionId();
          });

          callback(null, tModel, contentModel, headers, tArray, optionIds);
        })
        .fail(function (err) {
          callback(err);
        });
    }

  ], function (error, tModel, contentModel, headers, tArray, optionIds) {
    if (!error) {
      res.send({
        title: tModel.getTitle(),
        content_name: contentModel.getTitle_en(), // TODO 多言語
        youtube_video_id: tModel.getYoutubeVideoId(),
        video_length: tModel.getVideoLength(),
        language: tModel.getLanguage(),
        favorite: tModel.getFavorite(),
        is_private: tModel.getIsPrivate(),
        updated_at: tModel.getUpdatedAt(),
        created_at: tModel.getCreatedAt(),
        headers: headers,
        timeline_array: tArray,
        option_ids: optionIds,
      });
    } else {
      res.send("failed to get timeline data. Error: " + err.stack);
    }
  });
});

router.post('/new', function (req, res, next) {
  var par = req.body;
  var userId = req.session.user_id;
  var isLogin = !!userId;
  var title = par["title"];
  var youtubeVideoId = par["youtube_video_id"];
  var contentId = par["content_id"];
  var adminPassword = par["admin_password"];

  async.waterfall([
    function (callback) {
      request({
        url: sprintf(MyConst.YOUTUBE_DATA_API_URL_BASE, youtubeVideoId, MyConst.GOOGLE_API_KEY),
        method: 'GET',
        headers: {'Content-Type': 'application/json',},
      }, function (error, response, body) {
        if (error) {
          callback(error);
        }

        var data = JSON.parse(body);
        var validationErrors = [];
        var foundNum = Number(data['pageInfo']['totalResults']);
        var contentDetails;

        if (!isLogin) {
          validationErrors.push(MyConst.VALIDATION_ERROR_TYPES.MUST_BE_LOGINED);
        }

        if (!foundNum) {
          validationErrors.push(MyConst.VALIDATION_ERROR_TYPES.INVALID_YOUTUBE_ID);
        } else {
          contentDetails = data.items[0]["contentDetails"];
        }

        if (!ContentCollection.getModelById(contentId)) {
          validationErrors.push(MyConst.VALIDATION_ERROR_TYPES.INVALID_CONTENT_ID);
        }

        if (!validator.isLength(adminPassword, {min: 5, max: 30})) {
          validationErrors.push(MyConst.VALIDATION_ERROR_TYPES.TOO_SHORT_PASSWORD);
        }

        if (!validator.isLength(title, {min: 3, max: 30})) {
          validationErrors.push(MyConst.VALIDATION_ERROR_TYPES.TOO_SHORT_TITLE);
        }

        if (__.isEmpty(validationErrors)) {
          callback(null, contentDetails);
        } else {
          res.send({
            success: false,
            validation_errors: validationErrors,
          });
          callback('validation error', validationErrors);
        }
      });
    },

    function (contentDetails, callback) {
      var userId = req.session.user_id;
      // var language = MyUtil.unionStrArrayWithComma(par["language"]);
      var language = ''; // TODO
      var videoLength = MyUtil.convertISO8601TimeToSec(contentDetails.duration);

      Timeline.insert(userId, contentId, title, adminPassword, youtubeVideoId, videoLength, language)
        .then(function (idHash) {
          callback(null, idHash);
        })
        .fail(function (error) {
          callback(error);
        });
    },

  ], function (error, idHash) {
    if (error) {
      throw new Error(error);
    } else {
      res.send({
        success: true,
        id_hash: idHash,
      });
    }
  });

});

function orderTypeToQueryParam(orderType) {
  var result = {
    order_by: 'updated_at',
    is_asc: false,
  };

  switch (orderType) {
    case 'most_recent':
      result.order_by = 'timeline.updated_at';
      result.is_asc = false;
      break;

    case 'oldest':
      result.order_by = 'timeline.updated_at';
      result.is_asc = true;
      break;

    case 'views':
      result.order_by = 'timeline.views';
      result.is_asc = false;
      break;

    case 'less_views':
      result.order_by = 'timeline.views';
      result.is_asc = true;
      break;
  }

  return result;
}

module.exports = router;
