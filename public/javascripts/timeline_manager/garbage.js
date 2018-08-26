
// "test<センチネル>hoge<ランパート>fuga".match(/<[^<>]+>|.[^<>]*/g)
//  ["test", "<センチネル>", "hoge", "<ランパート>", "fuga"]






// abc<hoge>def => [abc,<hoge>,def]
//var splited = escaped.match(/<[^<>]+>|.[^<>]+/g);


//var text = "test[img=センチネル]hoge[s]大文字にしたい[/s]fuga";









var closingTag = null;
var split = escaped.match(/\[[^\[\]]+\]|[^\[\]]+/g);
_.each(split, function(t) {
  // tag
  if (t.match(/\[[^\[\]]+\]/)) {
    var tagAll = t.match(/[^\[\]]+/);
    var tag = tagAll[0];
    var value = tagAll[1]

    if (!closingTag) {



      if (hasClosingTag) {
        closingTag = "hoge";
      }
    }
    // finding closing tag
    else {

      // check starting and closing tag

      closingTag = null;
    }
  }
  // text
  else {
    console.log(t);
    // var textNode = document.createTextNode(text);
    // td.appendChild(textNode);
  }
});


_.each(_.keys(Const.FFXIV.JOBS), function(job) {
  var jobData = Const.FFXIV.JOBS[job];
  var skills = jobData.SKILL_IMAGES;

  console.log("------------ " + jobData.NAME + " -------------");

  _.each(skills, function(skill) {
    var parts = skill.split(".")[0].split("_")
    var name = "";

    // console.log(skill);

    for (i=0; i<parts.length; i++) {
      var part = parts[i];
      var top = part.charAt(0);

      if (part != "of") {
        top = top.toUpperCase();
      }

      name += top + part.slice(1);

      if (i < parts.length - 1) {
        name += " ";
      }
    }

    console.log(name);
  });
});
