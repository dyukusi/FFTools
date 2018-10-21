var Twitter = require('twitter');

function unionStrArrayWithComma(strArray) {
  var result = "";

  if (!__.isArray(strArray)) return strArray;

  for (var i = 0; i < strArray.length; i++) {
    result += strArray[i];

    if (i + 1 < strArray.length) {
      result += ",";
    }
  }

  return result;
}

function create2dimensionEmptyArray(rowNum, columnNum) {
  var arr = new Array(rowNum);

  for (var i = 0; i < rowNum; i++) {
    arr[i] = new Array(columnNum);
  }

  return arr;
}

function convertISO8601TimeToSec(str) {
  var split = str.match(/[0-9]+/g);
  var min = 0;
  var sec = 0;

  if (split.length == 2) {
    min = split[0];
    sec = split[1];
  } else {
    sec = split[0];
  }

  return (Number(min) * 60) + Number(sec);
}

function tweetTimelineIfNeed(oldModel, newModel) {
  var tweetText;

  if (newModel.getIsPrivate()) return;

  if (!oldModel.getUpdatedAt() || oldModel.getIsPrivate() && !newModel.getIsPrivate()) {
    tweetText = sprintf(MyConst.TWEET_NEW_TIMELINE_TEXT, newModel.getIdHash(), newModel.getTitle());
  } else {
    var oldTimestamp = new Date(oldModel.getUpdatedAt()).getTime() / 1000;
    var newTimestamp = new Date(newModel.getUpdatedAt()).getTime() / 1000;
    var diff = newTimestamp - oldTimestamp;
    var threshold = 60 * 60 * 12; // 12 hours
    if (diff < threshold) return;

    tweetText = sprintf(MyConst.TWEET_UPDATED_TIMELINE_TEXT, newModel.getIdHash(), newModel.getTitle());
  }

  if (tweetText) {
    tweet(tweetText);
  }
}

function tweet(text) {
  var client = new Twitter(MyConst.TWITTER_API_KEYS);
  client.post('statuses/update',
    {
      status: text,
    },
    function(err, tweet, response) {
      if (err) {
        throw new Error(err.text);
      }
      console.log("Successfully tweeted : " + tweet.text);
    }
  );
}

exports.unionStrArrayWithComma = unionStrArrayWithComma;
exports.create2dimensionEmptyArray = create2dimensionEmptyArray;
exports.convertISO8601TimeToSec = convertISO8601TimeToSec;
exports.tweetTimelineIfNeed = tweetTimelineIfNeed;
