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

exports.unionStrArrayWithComma = unionStrArrayWithComma;
exports.create2dimensionEmptyArray = create2dimensionEmptyArray;
exports.convertISO8601TimeToSec = convertISO8601TimeToSec;


