function removeColumn(data, indices) {
  var result = data;

  for (var i = 0; i < result.length; i++) {
    for (var j = 0; j < indices.length; j++) {
      result[i].splice(indices[j] - j, 1);
    }
  }

  return result;
}

function convertIntToMinSecStr(n) {
  var min = ("0" + parseInt(n / 60)).slice(-2);
  var sec = ("0" + n % 60).slice(-2);
  return min + ":" + sec;
}

// original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
function stripTags(input, allowed) {
  var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
    commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

  // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
  allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');

  return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
    return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
  });
}

function getLocationOrigin() {
  return location.origin ? location.origin
    : location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "");
}

exports.removeColumn = removeColumn;
exports.convertIntToMinSecStr = convertIntToMinSecStr;
exports.stripTags = stripTags;
exports.getLocationOrigin = getLocationOrigin;
