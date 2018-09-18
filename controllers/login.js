var appRoot = require('app-root-path');
var express = require('express');
var router = express.Router();
var crypt = require(appRoot + '/my_node_libs/crypt.js');
var TempUser = require(appRoot + '/models/TempUser.js').TempUser;
var User = require(appRoot + '/models/User.js').User;

router.get('/', function (req, res, next) {
    res.render('login', {
      title: 'ログイン'
    });
});

router.get('/status', function (req, res, next) {
  var userId = req.session.user_id;
  var isLogin = !!userId;

  if (isLogin){
    User.selectById(userId).then(function(userModel) {
      res.send({
        is_login: true,
        name: userModel.getName(),
        char_thumbnail_url: userModel.getCharacterThumbnailUrl(),
      });
    });
  } else {
    res.send({ is_login: false, });
  }
});

router.post('/', function (req, res, next) {
  var json = req.body;
  var email = json["email"];
  var password = json["password"];

  var hashedPassword = crypt.hashed(password);

  User.selectByEmail(email)
    .then(function (user) {
      if (hashedPassword == user.getHashedPassword()) {
        req.session.user_id = user.getId();

        res.send({ success: true, });
        User.updateLastLoginedAtByUserId(user.getId())
      } else {
        res.send({ success: false, });
      }
    })
    .fail(function(error) {
      res.send({ success: false, });
      throw new Error(error);
    });
});

module.exports = router;
