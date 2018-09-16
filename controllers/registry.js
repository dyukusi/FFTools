var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var cheerio = require('cheerio-httpcli');

var TempUser = require(appRoot + '/models/TempUser.js').TempUser;
var User = require(appRoot + '/models/User.js').User;

// 新規会員登録ページ
router.get('/', function (req, res, next) {
  res.render('registry/index', {title: 'Registration'});
});

// 登録ボタン押下処理
router.post('/', function (req, res, next) {
  var json = req.body;
  var loadstoneURL = json["loadstone_url"];
  var charId = Number(loadstoneURL.match(/[0-9]+/)[0]);
  var email = json["email"];
  var password = json["password"];

  TempUser.insert(charId, password, email)
    .then(
      function (result) {
        var d = Q.defer();

        var hash = result.hash;

        sendAuthenticationMail(charId, email, hash)
          .then(
            function () {
              d.resolve();
            },
            function () {
              d.reject("Mailer problem");
            }
          );

        return d.promise;
      })
    .then(function () {
      res.send({ success: true, });
    })
    .fail(function (val) {
      res.send({ success: false, });
    });
});

// 本登録処理
router.get('/confirm', function (req, res, next) {
  var hash = req.query["key"];

  // generate TempUserModel by DB
  TempUser.selectByHash(hash)
  // hash comparison
    .then(function (tempUser) {
      var d = Q.defer();

      if (tempUser.getIsConfirmed()) {
        d.reject("already registered");
      }

      getDataFromLoadstone(tempUser.getId())
        .then(function (data) {
          var selfIntro = data["selfIntro"];
          var name = data["name"];
          var charThumbnailUrl = data["charThumbnailUrl"];

          if (0 <= selfIntro.trim().indexOf(hash)) {
            d.resolve({
              tempUser: tempUser,
              name: name,
              charThumbnailUrl: charThumbnailUrl,
            });
          } else {
            d.reject("invalid hash");
          }

        });

      return d.promise;
    })
    // registration
    .then(function (data) {
      var d = Q.defer();
      var tempUser = data["tempUser"];
      var name = data["name"];
      var charThumbnailUrl = data["charThumbnailUrl"];

      User.insertNewUserWithUpdateIsConfirmed(
        tempUser.getId(),
        name,
        charThumbnailUrl,
        tempUser.getHashedPassword(),
        tempUser.getEncryptedEmail()
      ).then(function() {
        d.resolve();
      }).fail(function(error) {
        d.reject(error);
      });

      return d.promise;
    })
    .then(function() {
      res.render('registry/confirmation', {
        title: 'Registration Completed!',
        text: 'Thank you for registration! Now you can create your own timeline. Enjoy!'
      });
    })
    .fail(function (error) {
      res.render('registry/confirmation', {
        title: 'Registration Failed...',
        text: 'Please make sure that the HashCode written in Email properly Copy&Pasted to your Character Profile form in Loadstone.'
      });
    });
});

// sample(Dyukusi Yukapero): https://jp.finalfantasyxiv.com/lodestone/character/18968752/
function getDataFromLoadstone(charId) {
  var d = Q.defer()

  var loadstoneURL = sprintf(MyConst.LOADSTONE_CHAR, charId);
  var selfintroduction;
  var name;
  var charThumbnailUrl;

  cheerio.fetch(loadstoneURL, {q: 'node.js'}, function (err, $, res) {
    if (err) {
      console.log(err);
      d.reject("could not access loadstone");
      return;
    }

    $('.character__selfintroduction').each(function (idx) {
      selfintroduction = $(this).text().trim();
    });

    $('.frame__chara__name').each(function (idx) {
      name = $(this).text();
    });

    charThumbnailUrl = $('.frame__chara__face img')[0].attribs["src"];
    charThumbnailUrl = charThumbnailUrl.split("?")[0]; // remove query params

    if (selfintroduction) {
      d.resolve({
        selfIntro: selfintroduction,
        name: name,
        charThumbnailUrl: charThumbnailUrl,
      });
    } else {
      d.reject("could not find selfintroduction")
    }
  });

  return d.promise;
}

function sendAuthenticationMail(charId, email, hash) {
  var d = Q.defer();
  var loadstoneURL = sprintf(MyConst.LOADSTONE_CHAR, charId);
  var registrationConfirmURL = sprintf(MyConst.REGISTRATION_CONFIRM_URL, hash)

  var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: {
      user: MyConst.TM_EMAIL.ADDRESS,
      pass: MyConst.TM_EMAIL.PASSWORD,
    }
  });

  var mailOptions = {
    from: MyConst.FFXIV_TM_EMAIL,
    to: email,
    subject: 'Please verify your account for FFTimelines',
    text: sprintf(MyConst.CONFIRMATION_MAIL_TEXT, hash, loadstoneURL, registrationConfirmURL),
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      d.reject();
    } else {
      console.log('Message sent: ' + info.response);
      d.resolve();
    }
  });

  return d.promise;
}

module.exports = router;
